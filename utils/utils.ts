export function timeToSeconds(timeString: string): number {
  const [minutes, seconds] = timeString.split(":").map(Number);
  return minutes * 60 + seconds;
}

export function getRandomValue(min: number = 0, max: number = 255): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
