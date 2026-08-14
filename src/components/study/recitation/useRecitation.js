import { useState, useRef, useCallback, useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import { recitationService } from "../../../services/recitationService";

/**
 * Play a gentle Web Audio API beep for mic on / off
 */
function playMicOnSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

function playMicOffSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(784, ctx.currentTime); // G5
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.12); // A4
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

/**
 * Map word state string from server to canonical state name
 */
function mapWordState(rawState) {
  if (!rawState) return "Pending";
  const s = String(rawState).toLowerCase();
  if (s === "correct") return "Correct";
  if (s === "incorrect") return "Incorrect";
  return "Pending";
}

/**
 * Custom hook for real-time speech recitation via SignalR.
 */
export function useRecitation() {
  const [isListening, setIsListening] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [recitationStopped, setRecitationStopped] = useState(false);
  const [spokenWords, setSpokenWords] = useState([]);
  const [canonicalWords, setCanonicalWords] = useState([]);
  const [extras, setExtras] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [completedSummary, setCompletedSummary] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [furthestActiveWordIndex, setFurthestActiveWordIndex] = useState(-1);
  const [startDetection, setStartDetection] = useState(null);

  // Refs for managing active connections, streams, and timers
  const connectionRef = useRef(null);
  const sessionIdRef = useRef(null);
  const audioSubjectRef = useRef(null);
  const streamingPromiseRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const completionTimerRef = useRef(null);
  const extrasTimerRef = useRef(null);
  const isStoppingRef = useRef(false);
  const isConnectingRef = useRef(false);
  const stopListeningRef = useRef(null);
  const lastUpdateNumberRef = useRef(-1);
  const lastMaxEvaluatedIdxRef = useRef(-1);

  /**
   * Reset silence timer for automatic mic shutdown
   * @param {number} durationMs - timeout duration in milliseconds (default 8000ms = 8s)
   */
  const resetSilenceTimer = useCallback((durationMs = 8000) => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    silenceTimerRef.current = setTimeout(() => {
      if (!isStoppingRef.current) {
        console.log(`Recitation auto-stopped after ${durationMs / 1000}s silence.`);
        stopListeningRef.current?.();
      }
    }, durationMs);
  }, []);

  /**
   * Schedule automatic hiding of extras after 2.5s of no new extras
   */
  const scheduleExtrasHide = useCallback(() => {
    if (extrasTimerRef.current) {
      clearTimeout(extrasTimerRef.current);
    }
    extrasTimerRef.current = setTimeout(() => {
      setExtras([]);
      extrasTimerRef.current = null;
    }, 2500);
  }, []);

  /**
   * Stop local audio hardware tracks & context cleanly
   */
  const cleanupAudioResources = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (completionTimerRef.current) {
      clearTimeout(completionTimerRef.current);
      completionTimerRef.current = null;
    }
    setActiveWordIndex(-1);

    try {
      if (workletNodeRef.current) {
        workletNodeRef.current.port.onmessage = null;
        workletNodeRef.current.disconnect();
        workletNodeRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    } catch (e) {
      console.warn("Audio cleanup exception:", e);
    }
  }, []);

  /**
   * Handle real-time RecitationUpdated event from SignalR Hub.
   */
  const handleRecitationUpdate = useCallback((snapshot) => {
    if (!snapshot) return;

    const updateNum = snapshot.updateNumber ?? snapshot.UpdateNumber ?? null;
    if (typeof updateNum === "number") {
      if (updateNum <= lastUpdateNumberRef.current) return;
      lastUpdateNumberRef.current = updateNum;
    }

    const transcriptVal = snapshot.transcript || snapshot.Transcript || "";
    if (transcriptVal) setTranscript(transcriptVal);

    const rawExtras = Array.isArray(snapshot.extras)
      ? snapshot.extras
      : Array.isArray(snapshot.Extras)
      ? snapshot.Extras
      : [];
    setExtras(rawExtras);

    const activeIndex = snapshot.activeWordIndex ?? snapshot.ActiveWordIndex ?? null;
    setActiveWordIndex(Number.isInteger(activeIndex) ? activeIndex : -1);
    if (Number.isInteger(activeIndex)) {
      setFurthestActiveWordIndex((previous) => Math.max(previous, activeIndex));
    }

    const startDetRaw = snapshot.startDetection || snapshot.StartDetection || null;
    let detectedStartIndex = null;
    let detectionStatus = "Searching";
    if (startDetRaw) {
      detectionStatus = startDetRaw.status || startDetRaw.Status || "Searching";
      const startIndex = startDetRaw.startWordIndex ?? startDetRaw.StartWordIndex ?? null;
      if (detectionStatus === "Detected" && Number.isInteger(startIndex)) {
        detectedStartIndex = startIndex;
      }
      setStartDetection({
        status: detectionStatus,
        startWordIndex: startIndex,
        confidence: startDetRaw.confidence ?? startDetRaw.Confidence ?? 0,
        runnerUpConfidence: startDetRaw.runnerUpConfidence ?? startDetRaw.RunnerUpConfidence ?? 0,
        probeWordCount: startDetRaw.probeWordCount ?? startDetRaw.ProbeWordCount ?? 0,
        requiredProbeWordCount: startDetRaw.requiredProbeWordCount ?? startDetRaw.RequiredProbeWordCount ?? 0,
      });
    }

    const rawWords = Array.isArray(snapshot.words)
      ? snapshot.words
      : Array.isArray(snapshot.Words)
      ? snapshot.Words
      : [];
    if (rawWords.length === 0) return;

    const formattedWords = [];
    let maxEvaluatedIdx = -1;
    rawWords.forEach((word, fallbackIndex) => {
      const index = typeof word.index === "number"
        ? word.index
        : typeof word.Index === "number"
        ? word.Index
        : fallbackIndex;
      const state = mapWordState(word.state ?? word.State);
      if (state !== "Pending") maxEvaluatedIdx = Math.max(maxEvaluatedIdx, index);

      formattedWords[index] = {
        index,
        word: word.displayText || word.DisplayText || word.word || word.Word || "",
        state,
        recognizedText: word.recognizedText ?? word.RecognizedText ?? null,
        reasonCode: word.reasonCode ?? word.ReasonCode ?? null,
        similarity: word.similarity ?? word.Similarity ?? null,
        isFinalized: Boolean(word.isFinalized ?? word.IsFinalized ?? false),
      };
    });
    setSpokenWords(formattedWords);

    const evaluationStart = detectedStartIndex ?? 0;
    const relevantWords = formattedWords.filter(
      (word) => word && word.index >= evaluationStart
    );
    const detectionReady = detectionStatus === "Detected" || detectionStatus === "Disabled";
    const allCompleted = detectionReady
      && relevantWords.length > 0
      && relevantWords.every((word) => word.state !== "Pending");

    if (allCompleted && maxEvaluatedIdx !== -1) {
      if (!isStoppingRef.current && !completionTimerRef.current) {
        completionTimerRef.current = setTimeout(() => {
          completionTimerRef.current = null;
          stopListeningRef.current?.();
        }, 1300);
      }
    } else if (maxEvaluatedIdx > (lastMaxEvaluatedIdxRef.current || -1)) {
      lastMaxEvaluatedIdxRef.current = maxEvaluatedIdx;
      resetSilenceTimer(8000);
    }
  }, [resetSilenceTimer]);

  /**
   * Handle RecitationCompleted event from SignalR Hub
   */
  const handleRecitationCompleted = useCallback((result) => {
    if (isConnectingRef.current) {
      console.log("RecitationCompleted ignored during connection setup.");
      return;
    }
    const detectedStartIdx =
      result?.detectedStartWordIndex !== undefined && result?.detectedStartWordIndex !== null
        ? result.detectedStartWordIndex
        : result?.DetectedStartWordIndex !== undefined && result?.DetectedStartWordIndex !== null
        ? result.DetectedStartWordIndex
        : null;

    if (!isStoppingRef.current) {
      playMicOffSound();
    }
    cleanupAudioResources();

    setCompletedSummary({
      ...result,
      detectedStartWordIndex: detectedStartIdx,
    });
    setIsListening(false);
    setIsConnecting(false);
    setRecitationStopped(true);
    setActiveWordIndex(-1);
    scheduleExtrasHide();
  }, [cleanupAudioResources, scheduleExtrasHide]);

  /**
   * Translate raw server error to user-friendly Arabic message
   */
  const translateRecitationError = (rawError) => {
    if (!rawError) return null;
    const msg = typeof rawError === "string"
      ? rawError
      : (rawError?.message || rawError?.code || rawError?.name || String(rawError || ""));

    const s = msg.toLowerCase();

    // Ignore benign / session recovery errors
    if (
      s.includes("session_not_found") ||
      s.includes("active_session_exists") ||
      s.includes("canceled") ||
      s.includes("abort") ||
      s.includes("stopped")
    ) {
      return null;
    }

    // Specific user-friendly error messages
    if (s.includes("notallowederror") || s.includes("permission denied") || s.includes("permissiondenied")) {
      return "يرجى السماح للمتصفح بالوصول إلى المايكروفون لبدء التسميع.";
    }
    if (s.includes("notfounderror") || s.includes("no microphone")) {
      return "لم يتم العثور على مايكروفون متصل بجهازك.";
    }
    if (s.includes("hadith_not_found")) {
      return "الحديث المطلوب غير موجود على السيرفر.";
    }
    if (s.includes("token_revoked") || s.includes("401") || s.includes("unauthorized")) {
      return "انتهت جلسة تسجيل الدخول، يرجى إعادة تسجيل الدخول لمتابعة التسميع.";
    }
    if (s.includes("provider_unavailable")) {
      return "خدمة التسميع بالذكاء الاصطناعي غير متوفرة حالياً، يرجى المحاولة لاحقاً.";
    }
    if (s.includes("session_start_failed")) {
      return "تعذر بدء جلسة التسميع على السيرفر.";
    }

    return "حدث خطأ غير متوقع أثناء التسميع الصوتي. يرجى المحاولة لاحقاً.";
  };

  /**
   * Handle RecitationError event from SignalR Hub
   */
  const handleRecitationError = useCallback((err) => {
    console.warn("RecitationError received:", err);

    if (!err || err.fatal !== true) return;
    if (isStoppingRef.current) return;

    const friendlyMsg = translateRecitationError(err);
    if (!friendlyMsg) return;

    setErrorMsg(friendlyMsg);
    cleanupAudioResources();
    setIsListening(false);
    setIsConnecting(false);
    setRecitationStopped(true);
  }, []);

  /**
   * Start recitation session
   */
  const startListening = useCallback(async (hadithId) => {
    if (!hadithId) {
      setErrorMsg("رقم الحديث غير محدد.");
      return;
    }

    try {
      isConnectingRef.current = true;
      isStoppingRef.current = false;
      setErrorMsg(null);
      setSpokenWords([]);
      setCanonicalWords([]);
      setTranscript("");
      setCompletedSummary(null);
      setRecitationStopped(false);
      setStartDetection(null);
      setActiveWordIndex(-1);
      setFurthestActiveWordIndex(-1);
      lastUpdateNumberRef.current = -1;
      lastMaxEvaluatedIdxRef.current = -1;
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (completionTimerRef.current) {
        clearTimeout(completionTimerRef.current);
        completionTimerRef.current = null;
      }
      setIsConnecting(true);

      // If a previous stop operation is finishing or connection exists, wait & clean up
      if (isStoppingRef.current) {
        await new Promise((r) => setTimeout(r, 350));
      }
      if (connectionRef.current) {
        await recitationService.stopConnection(connectionRef.current).catch(() => {});
        connectionRef.current = null;
      }

      // 1. Build and start SignalR Connection with event handlers
      let connection = await recitationService.buildConnection({
        onUpdated: handleRecitationUpdate,
        onCompleted: handleRecitationCompleted,
        onError: handleRecitationError,
      });
      connectionRef.current = connection;

      // Clear previous session ID references
      localStorage.removeItem("recitation_session_id");
      sessionIdRef.current = null;

      // 2. Invoke StartRecitation(hadithId) with auto-recovery for ACTIVE_SESSION_EXISTS or rapid reconnects
      let started = null;
      try {
        started = await recitationService.startRecitation(connection, hadithId);
      } catch (startErr) {
        const errStr = String(startErr?.message || startErr || "").toLowerCase();
        if (
          errStr.includes("active_session_exists") ||
          errStr.includes("session") ||
          errStr.includes("canceled") ||
          errStr.includes("closed") ||
          errStr.includes("invocation") ||
          errStr.includes("stopped")
        ) {
          console.warn("Connection or session recovery triggered, reconnecting...", startErr?.message);
          try {
            await recitationService.stopConnection(connection).catch(() => {});
            await new Promise((r) => setTimeout(r, 350));
            connection = await recitationService.buildConnection({
              onUpdated: handleRecitationUpdate,
              onCompleted: handleRecitationCompleted,
              onError: handleRecitationError,
            });
            connectionRef.current = connection;
            started = await recitationService.startRecitation(connection, hadithId);
          } catch (retryErr) {
            console.warn("StartRecitation retry failed:", retryErr);
            throw startErr;
          }
        } else {
          throw startErr;
        }
      }

      if (!started || !started.sessionId) {
        throw new Error("لم نتمكن من بدء جلسة التسميع على السيرفر");
      }
      sessionIdRef.current = started.sessionId;
      localStorage.setItem("recitation_session_id", started.sessionId);

      const startedWords = Array.isArray(started.words)
        ? started.words
        : Array.isArray(started.Words)
        ? started.Words
        : [];
      const initialWords = [];
      const initialCanonicalWords = [];
      startedWords.forEach((word, fallbackIndex) => {
        const index = typeof word.index === "number"
          ? word.index
          : typeof word.Index === "number"
          ? word.Index
          : fallbackIndex;
        const displayText = word.displayText
          || word.DisplayText
          || word.word
          || word.Word
          || "";
        initialCanonicalWords[index] = { index, word: displayText };
        initialWords[index] = {
          index,
          word: displayText,
          state: "Pending",
          recognizedText: null,
          reasonCode: "not-reached",
          isFinalized: false,
        };
      });
      setCanonicalWords(initialCanonicalWords);
      setSpokenWords(initialWords);

      // 4. Create audio Subject for streaming
      const audioSubject = new signalR.Subject();
      audioSubjectRef.current = audioSubject;

      // 5. Invoke StreamAudio(sessionId, audioSubject)
      const streamingPromise = recitationService.streamAudio(
        connection,
        started.sessionId,
        audioSubject
      );
      streamingPromiseRef.current = streamingPromise;

      // 6. Initialize Microphone & AudioWorklet
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      await audioContext.audioWorklet.addModule("/pcm-processor.js");

      const source = audioContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioContext, "pcm-processor");
      workletNodeRef.current = workletNode;

      workletNode.port.onmessage = (event) => {
        const data = event.data;
        if (!data) return;
        const chunk = data.chunk || (data instanceof Uint8Array ? data : null);

        if (
          chunk &&
          audioSubjectRef.current &&
          connectionRef.current &&
          connectionRef.current.state === signalR.HubConnectionState.Connected
        ) {
          audioSubjectRef.current.next(chunk);
        }
      };

      source.connect(workletNode);
      // Connect to destination to keep worklet active (muted)
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0;
      workletNode.connect(gainNode);
      gainNode.connect(audioContext.destination);

      isConnectingRef.current = false;
      setIsConnecting(false);
      setIsListening(true);
      resetSilenceTimer(10000); // 10-second initial silence window
      playMicOnSound();
    } catch (err) {
      console.error("Failed to start recitation:", err);
      isConnectingRef.current = false;
      if (!isStoppingRef.current) {
        setErrorMsg(translateRecitationError(err));
      }
      cleanupAudioResources();
      if (connectionRef.current) {
        await recitationService.stopConnection(connectionRef.current);
        connectionRef.current = null;
      }
      setIsConnecting(false);
      setIsListening(false);
    }
  }, [handleRecitationUpdate, handleRecitationCompleted, handleRecitationError, cleanupAudioResources, resetSilenceTimer]);

  /**
   * Stop recitation session gracefully and send FinishRecitation.
   */
  const stopListening = useCallback(async () => {
    stopListeningRef.current = stopListening;
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

    const conn = connectionRef.current;
    const sid = sessionIdRef.current;
    const subject = audioSubjectRef.current;
    const streamPromise = streamingPromiseRef.current;

    playMicOffSound();

    cleanupAudioResources();
    setIsListening(false);
    setIsConnecting(false);
    setRecitationStopped(true);
    scheduleExtrasHide();

    try {
      if (workletNodeRef.current) {
        workletNodeRef.current.port.postMessage("FLUSH");
      }

      if (subject) {
        subject.complete();
        audioSubjectRef.current = null;
      }

      if (streamPromise) {
        await streamPromise.catch(() => {});
        streamingPromiseRef.current = null;
      }

      if (conn && sid) {
        await recitationService.finishRecitation(conn, sid).catch(() => {});
      }
    } catch (err) {
      console.warn("Error stopping recitation session:", err);
    } finally {
      if (conn) {
        await recitationService.stopConnection(conn).catch(() => {});
        if (connectionRef.current === conn) {
          connectionRef.current = null;
        }
      }
      if (sessionIdRef.current === sid) {
        sessionIdRef.current = null;
      }
      localStorage.removeItem("recitation_session_id");
      isStoppingRef.current = false;
    }
  }, [cleanupAudioResources, scheduleExtrasHide]);

  // Keep stopListeningRef updated safely without render-phase ref mutation
  useEffect(() => {
    stopListeningRef.current = stopListening;
  }, [stopListening]);

  /**
   * Request hint from backend
   */
  const requestHint = useCallback(async (wordCount) => {
    const connection = connectionRef.current;
    const sessionId = sessionIdRef.current;
    if (!connection || !sessionId || !isListening) return null;

    try {
      return await recitationService.requestHint(connection, sessionId, wordCount);
    } catch (error) {
      console.warn("RequestHint failed:", error);
      setErrorMsg("تعذر إظهار التلميح الآن، يرجى المحاولة مرة أخرى.");
      return null;
    }
  }, [isListening]);

  /**
   * Cancel recitation session without saving
   */
  const cancelRecitation = useCallback(async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;
    playMicOffSound();
    setIsListening(false);
    setIsConnecting(false);
    try {
      cleanupAudioResources();
      if (audioSubjectRef.current) {
        audioSubjectRef.current.complete();
      }
      if (connectionRef.current && sessionIdRef.current) {
        await recitationService.cancelRecitation(
          connectionRef.current,
          sessionIdRef.current
        ).catch(() => {});
      }
    } catch (err) {
      console.warn("Cancel recitation exception:", err);
    } finally {
      if (connectionRef.current) {
        await recitationService.stopConnection(connectionRef.current).catch(() => {});
        connectionRef.current = null;
      }
      sessionIdRef.current = null;
      localStorage.removeItem("recitation_session_id");
      setRecitationStopped(true);
      isStoppingRef.current = false;
    }
  }, [cleanupAudioResources]);

  /**
   * Reset local state
   */
  const resetRecitation = useCallback(() => {
    setSpokenWords([]);
    setCanonicalWords([]);
    setExtras([]);
    setStartDetection(null);
    if (extrasTimerRef.current) {
      clearTimeout(extrasTimerRef.current);
      extrasTimerRef.current = null;
    }
    setTranscript("");
    setCompletedSummary(null);
    setErrorMsg(null);
    setRecitationStopped(false);
    setActiveWordIndex(-1);
    setFurthestActiveWordIndex(-1);
    lastUpdateNumberRef.current = -1;
    lastMaxEvaluatedIdxRef.current = -1;

    if (completionTimerRef.current) {
      clearTimeout(completionTimerRef.current);
      completionTimerRef.current = null;
    }
  }, []);

  // Cleanup resources when component unmounts
  useEffect(() => {
    return () => {
      cleanupAudioResources();
      if (connectionRef.current) {
        recitationService.stopConnection(connectionRef.current);
      }
    };
  }, [cleanupAudioResources]);

  return {
    isListening,
    isConnecting,
    recitationStopped,
    spokenWords,
    canonicalWords,
    extras,
    transcript,
    completedSummary,
    errorMsg,
    activeWordIndex,
    furthestActiveWordIndex,
    startDetection,
    startListening,
    stopListening,
    requestHint,
    cancelRecitation,
    resetRecitation,
  };
}
