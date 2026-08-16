import * as signalR from "@microsoft/signalr";
import { MessagePackHubProtocol } from "@microsoft/signalr-protocol-msgpack";
import { API_BASE_URL, getAccessToken } from "../api/client";

/**
 * SignalR Hub URL for Hadith Recitation
 */
const RECITATION_HUB_URL = `${API_BASE_URL}/hubs/recitation`;

export const recitationService = {
  /**
   * Build and start a new SignalR hub connection configured with MessagePack protocol
   */
  async buildConnection({ onUpdated, onCompleted, onError }) {
    const createConnection = () => {
      const conn = new signalR.HubConnectionBuilder()
        .withUrl(RECITATION_HUB_URL, {
          accessTokenFactory: () => getAccessToken() || "",
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        })
        .withHubProtocol(new MessagePackHubProtocol())
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      if (onUpdated) conn.on("RecitationUpdated", onUpdated);
      if (onCompleted) conn.on("RecitationCompleted", onCompleted);
      if (onError) conn.on("RecitationError", onError);
      return conn;
    };

    let connection = createConnection();
    try {
      await connection.start();
      return connection;
    } catch (firstErr) {
      console.warn("SignalR connection attempt 1 failed, retrying in 350ms...", firstErr?.message);
      await new Promise((r) => setTimeout(r, 350));
      connection = createConnection();
      await connection.start();
      return connection;
    }
  },

  /**
   * Invoke StartRecitation on the SignalR Hub
   * @param {signalR.HubConnection} connection 
   * @param {number|string} hadithId 
   * @returns {Promise<{sessionId: string, hadithId: number, audio: object, words: array}>}
   */
  async startRecitation(connection, hadithId) {
    return await connection.invoke("StartRecitation", Number(hadithId));
  },

  /**
   * Stream audio chunks over SignalR via Subject<Uint8Array>
   * @param {signalR.HubConnection} connection 
   * @param {string} sessionId 
   * @param {signalR.Subject<Uint8Array>} audioStream 
   * @returns {Promise<void>}
   */
  async streamAudio(connection, sessionId, audioStream) {
    return await connection.invoke("StreamAudio", sessionId, audioStream);
  },

  /**
   * Ask the backend to reveal and permanently mark one or three words as hinted.
   * @param {signalR.HubConnection} connection
   * @param {string} sessionId
   * @param {number} wordCount
   */
  async requestHint(connection, sessionId, wordCount) {
    return await connection.invoke("RequestHint", sessionId, Number(wordCount));
  },

  /**
   * Invoke FinishRecitation when user completes recitation
   * @param {signalR.HubConnection} connection 
   * @param {string} sessionId 
   */
  async finishRecitation(connection, sessionId) {
    return await connection.invoke("FinishRecitation", sessionId);
  },

  /**
   * Invoke CancelRecitation to abandon session without saving
   * @param {signalR.HubConnection} connection 
   * @param {string} sessionId 
   */
  async cancelRecitation(connection, sessionId) {
    return await connection.invoke("CancelRecitation", sessionId);
  },

  /**
   * Safely stop connection
   * @param {signalR.HubConnection} connection 
   */
  async stopConnection(connection) {
    if (connection) {
      try {
        connection.off("RecitationUpdated");
        connection.off("RecitationCompleted");
        connection.off("RecitationError");
        await connection.stop();
      } catch (err) {
        console.warn("SignalR connection stop warning:", err);
      }
    }
  }
};
