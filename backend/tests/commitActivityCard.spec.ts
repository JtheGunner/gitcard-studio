import { describe, it, expect } from 'vitest';
import { renderCommitActivityCard } from '../src/adapters/presenters/commitActivityCard';

describe('renderCommitActivityCard', () => {
  it('should render a valid SVG string for commit activity card', () => {
    const svg = renderCommitActivityCard({ username: 'testuser' }, { theme: 'dark', locale: 'es' });
    expect(svg).toContain('<svg');
    expect(svg).toContain('Matriz de Hábitos de Commit');
    expect(svg).toContain('github.com/testuser');
  });

  it('should classify as Night Owl when most commits occur at night', () => {
    // 7 days x 24 hours matrix, night hours (18-23, 0-3) filled
    const matrix = Array.from({ length: 7 }, () => Array(24).fill(0));
    matrix[0][20] = 10;
    matrix[1][22] = 15;

    const svg = renderCommitActivityCard(
      { username: 'nightowl', hourlyMatrix: matrix },
      { locale: 'es' }
    );
    expect(svg).toContain('🦉 Búho Nocturno');
  });

  it('should classify as Early Bird when most commits occur during daytime', () => {
    const matrix = Array.from({ length: 7 }, () => Array(24).fill(0));
    matrix[0][9] = 20;
    matrix[2][14] = 15;

    const svg = renderCommitActivityCard(
      { username: 'earlybird', hourlyMatrix: matrix },
      { locale: 'es' }
    );
    expect(svg).toContain('🌅 Madrugador');
  });

  it('should render in English when no locale is given', () => {
    const svg = renderCommitActivityCard({ username: 'octocat' });
    expect(svg).toContain('Commit Activity Matrix');
    expect(svg).not.toContain('Matriz de Hábitos de Commit');
  });

  it('should support English locale', () => {
    const svg = renderCommitActivityCard({ username: 'octocat' }, { locale: 'en' });
    expect(svg).toContain('Commit Activity Matrix');
    expect(svg).toContain('Mon');
  });

  it('should keep every grid cell inside the card with a right margin', () => {
    const svg = renderCommitActivityCard({ username: 'octocat' });
    const viewBoxWidth = Number(/viewBox="0 0 (\d+) /.exec(svg)?.[1]);
    const cells = [...svg.matchAll(/<rect x="([\d.]+)" y="[\d.]+" width="([\d.]+)" height="12"/g)];

    expect(cells).toHaveLength(7 * 24);
    const rightEdge = Math.max(...cells.map((c) => Number(c[1]) + Number(c[2])));
    expect(rightEdge).toBeLessThanOrEqual(viewBoxWidth - 10);
  });
});
