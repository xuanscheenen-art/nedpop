import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sampleRate = 44100;

const sounds = [
  ["aa", { start: [760, 1250, 2500], duration: 0.72 }],
  ["ee", { start: [390, 2200, 2850], duration: 0.66 }],
  ["ie", { start: [280, 2400, 3100], duration: 0.62 }],
  ["oo", { start: [360, 850, 2400], duration: 0.7 }],
  ["uu", { start: [300, 1650, 2300], duration: 0.7 }],
  ["oe", { start: [300, 780, 2300], duration: 0.68 }],
  ["eu", { start: [430, 1550, 2300], duration: 0.68 }],
  ["ei-ij", { start: [650, 1750, 2600], end: [360, 2300, 3000], duration: 0.78 }],
  ["ui", { start: [330, 820, 2300], end: [480, 1700, 2450], duration: 0.82 }],
  ["au-ou", { start: [720, 1200, 2500], end: [360, 850, 2300], duration: 0.78 }],
];

const noiseSounds = [
  ["g-ch", { centerStart: 1450, centerEnd: 1550, duration: 0.58 }],
  ["sch", { centerStart: 4200, centerEnd: 1600, duration: 0.82 }],
  ["en-ending", { centerStart: 1050, centerEnd: 850, duration: 0.58 }],
];

function envelope(t, duration) {
  const attack = 0.05;
  const release = 0.08;
  if (t < attack) return t / attack;
  if (t > duration - release) return Math.max(0, (duration - t) / release);
  return 1;
}

function interpolate(start, end, amount) {
  return start + (end - start) * amount;
}

function makeVowel({ start, end = start, duration }) {
  const length = Math.floor(sampleRate * duration);
  const samples = new Float32Array(length);
  const formantWeights = [0.7, 0.36, 0.18];
  for (let index = 0; index < length; index += 1) {
    const t = index / sampleRate;
    const amount = index / Math.max(1, length - 1);
    const fundamental = interpolate(150, 142, amount);
    let value = 0;
    for (let harmonic = 1; harmonic <= 32; harmonic += 1) {
      const frequency = fundamental * harmonic;
      let gain = 0;
      for (let formantIndex = 0; formantIndex < 3; formantIndex += 1) {
        const formant = interpolate(start[formantIndex], end[formantIndex], amount);
        const bandwidth = formantIndex === 0 ? 90 : 150;
        const distance = (frequency - formant) / bandwidth;
        gain += formantWeights[formantIndex] * Math.exp(-0.5 * distance * distance);
      }
      value += Math.sin(2 * Math.PI * frequency * t) * gain / harmonic;
    }
    samples[index] = value * 0.22 * envelope(t, duration);
  }
  return samples;
}

function makeNoise({ centerStart, centerEnd, duration }) {
  const length = Math.floor(sampleRate * duration);
  const samples = new Float32Array(length);
  let low = 0;
  let band = 0;
  for (let index = 0; index < length; index += 1) {
    const t = index / sampleRate;
    const amount = index / Math.max(1, length - 1);
    const center = interpolate(centerStart, centerEnd, amount);
    const f = 2 * Math.sin(Math.PI * center / sampleRate);
    const q = 0.08;
    const input = Math.random() * 2 - 1;
    low += f * band;
    const high = input - low - q * band;
    band += f * high;
    samples[index] = band * 0.16 * envelope(t, duration);
  }
  return samples;
}

function writeWav(relativePath, samples) {
  const outputPath = join(root, relativePath);
  mkdirSync(dirname(outputPath), { recursive: true });
  const dataLength = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataLength);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataLength, 40);
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + index * 2);
  }
  writeFileSync(outputPath, buffer);
}

for (const [name, shape] of sounds) {
  writeWav(`public/audio/nl/isolated-sounds/${name}.wav`, makeVowel(shape));
}

for (const [name, shape] of noiseSounds) {
  writeWav(`public/audio/nl/isolated-sounds/${name}.wav`, makeNoise(shape));
}
