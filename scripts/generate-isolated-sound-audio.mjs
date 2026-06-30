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
  ["ai", { start: [760, 1250, 2500], end: [280, 2400, 3100], duration: 0.76 }],
];

const noiseSounds = [
  ["g-ch", { centerStart: 1450, centerEnd: 1550, duration: 0.58 }],
  ["sch", { centerStart: 4200, centerEnd: 1600, duration: 0.82 }],
  ["en-ending", { centerStart: 1050, centerEnd: 850, duration: 0.58 }],
];

const compoundSounds = [
  ["sj-tj", makeSjTj],
  ["h", makeDutchH],
  ["w", makeDutchW],
  ["r", makeDutchR],
];

const requestedNames = new Set(process.argv.slice(2));

function shouldWrite(name) {
  return requestedNames.size === 0 || requestedNames.has(name);
}

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

function silence(duration) {
  return new Float32Array(Math.floor(sampleRate * duration));
}

function concatSamples(parts) {
  const length = parts.reduce((total, part) => total + part.length, 0);
  const samples = new Float32Array(length);
  let offset = 0;
  for (const part of parts) {
    samples.set(part, offset);
    offset += part.length;
  }
  return samples;
}

function makeSjTj() {
  const sj = makeNoise({ centerStart: 4400, centerEnd: 4100, duration: 0.34 });
  const tjStop = silence(0.045);
  const tjRelease = makeNoise({ centerStart: 5200, centerEnd: 4300, duration: 0.16 });
  return concatSamples([sj, silence(0.14), tjStop, tjRelease]);
}

function makeDutchW() {
  const duration = 0.42;
  const length = Math.floor(sampleRate * duration);
  const samples = new Float32Array(length);
  let low = 0;
  let band = 0;
  for (let index = 0; index < length; index += 1) {
    const t = index / sampleRate;
    const amount = index / Math.max(1, length - 1);
    const fundamental = interpolate(150, 135, amount);
    const voice =
      Math.sin(2 * Math.PI * fundamental * t) * 0.28 +
      Math.sin(2 * Math.PI * fundamental * 2 * t) * 0.12 +
      Math.sin(2 * Math.PI * fundamental * 3 * t) * 0.06;
    const f = 2 * Math.sin(Math.PI * 950 / sampleRate);
    const q = 0.1;
    const input = Math.random() * 2 - 1;
    low += f * band;
    const high = input - low - q * band;
    band += f * high;
    samples[index] = (voice * 0.2 + band * 0.035) * envelope(t, duration);
  }
  return samples;
}

function makeDutchH() {
  const duration = 0.4;
  const length = Math.floor(sampleRate * duration);
  const samples = new Float32Array(length);
  let low = 0;
  let band = 0;
  for (let index = 0; index < length; index += 1) {
    const t = index / sampleRate;
    const amount = index / Math.max(1, length - 1);
    const center = interpolate(1650, 1200, amount);
    const f = 2 * Math.sin(Math.PI * center / sampleRate);
    const q = 0.16;
    const input = Math.random() * 2 - 1;
    low += f * band;
    const high = input - low - q * band;
    band += f * high;
    samples[index] = band * 0.075 * envelope(t, duration);
  }
  return samples;
}

function makeDutchR() {
  const duration = 0.52;
  const length = Math.floor(sampleRate * duration);
  const samples = new Float32Array(length);
  let low = 0;
  let band = 0;
  for (let index = 0; index < length; index += 1) {
    const t = index / sampleRate;
    const trill = Math.max(0, Math.sin(2 * Math.PI * 26 * t));
    const f = 2 * Math.sin(Math.PI * 1250 / sampleRate);
    const q = 0.08;
    const input = Math.random() * 2 - 1;
    low += f * band;
    const high = input - low - q * band;
    band += f * high;
    const voice = Math.sin(2 * Math.PI * 130 * t) * 0.12;
    samples[index] = (band * 0.14 * trill + voice * trill) * envelope(t, duration);
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
  if (!shouldWrite(name)) continue;
  writeWav(`public/audio/nl/isolated-sounds/${name}.wav`, makeVowel(shape));
}

for (const [name, shape] of noiseSounds) {
  if (!shouldWrite(name)) continue;
  writeWav(`public/audio/nl/isolated-sounds/${name}.wav`, makeNoise(shape));
}

for (const [name, makeSamples] of compoundSounds) {
  if (!shouldWrite(name)) continue;
  writeWav(`public/audio/nl/isolated-sounds/${name}.wav`, makeSamples());
}
