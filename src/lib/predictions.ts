export type Point = { x: number; y: number };

export function calculateLinearRegression(points: Point[]): { slope: number; intercept: number } {
  const n = points.length;
  if (n < 2) {
    return { slope: NaN, intercept: NaN };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumX2 += point.x * point.x;
  }

  const denominator = (n * sumX2 - sumX * sumX);
  if (denominator === 0) {
      return { slope: NaN, intercept: NaN };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}
