/**
 * AudioWorklet Processor for Athar Real-time Speech Recitation
 * Downmixes input audio to mono, resamples to 16kHz PCM16 Little-Endian,
 * and emits exact 1,600-byte (800 Int16 samples / 50ms) chunks to the main thread.
 */

class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Int16Array(800);
    this.bufferIndex = 0;
    
    // Resampling state
    this.resampleRatio = sampleRate / 16000;
    this.resamplePos = 0;

    this.port.onmessage = (event) => {
      if (event.data === 'FLUSH') {
        this.flushPaddedChunk();
      }
    };
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;

    const channelCount = input.length;
    const sampleLength = input[0].length;
    if (sampleLength === 0) return true;

    // 1. Downmix to mono float32
    const monoSamples = new Float32Array(sampleLength);
    for (let i = 0; i < sampleLength; i++) {
      let sum = 0;
      for (let ch = 0; ch < channelCount; ch++) {
        sum += input[ch][i];
      }
      monoSamples[i] = sum / channelCount;
    }

    // 2. Linear resampling to 16kHz
    while (this.resamplePos < sampleLength) {
      const index0 = Math.floor(this.resamplePos);
      const index1 = Math.min(index0 + 1, sampleLength - 1);
      const alpha = this.resamplePos - index0;

      const sample0 = monoSamples[index0];
      const sample1 = monoSamples[index1];
      const interpolatedSample = sample0 + alpha * (sample1 - sample0);

      // Clamp [-1, 1] and encode to signed Int16 PCM (-32768 to 32767)
      const clamped = Math.max(-1, Math.min(1, interpolatedSample));
      const pcm16 = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;

      this.buffer[this.bufferIndex++] = pcm16;

      // When 800 samples (1600 bytes) gathered, emit chunk
      if (this.bufferIndex === 800) {
        this.emitChunk(this.buffer);
        this.buffer = new Int16Array(800);
        this.bufferIndex = 0;
      }

      this.resamplePos += this.resampleRatio;
    }

    this.resamplePos -= sampleLength;
    return true;
  }

  emitChunk(int16Array) {
    // Convert Int16Array (800 samples) to Uint8Array (1600 bytes) Little-Endian
    const uint8Array = new Uint8Array(int16Array.buffer);
    this.port.postMessage(uint8Array, [uint8Array.buffer]);
  }

  flushPaddedChunk() {
    if (this.bufferIndex > 0) {
      // Pad remaining samples with zeros to complete 800 samples (1600 bytes)
      for (let i = this.bufferIndex; i < 800; i++) {
        this.buffer[i] = 0;
      }
      this.emitChunk(this.buffer);
      this.buffer = new Int16Array(800);
      this.bufferIndex = 0;
    }
  }
}

registerProcessor('pcm-processor', PCMProcessor);
