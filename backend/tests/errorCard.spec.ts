import { describe, expect, it } from 'vitest';
import { renderErrorCard } from '../src/adapters/presenters/errorCard';

describe('renderErrorCard Presenter', () => {
  it('should render a clean Spanish 404 user not found error card for locale=es', () => {
    const rawError = 'GitHub API error (404) for URL https://api.github.com/users/joaltoorc';
    const svg = renderErrorCard(rawError, 'dark', { username: 'joaltoorc', locale: 'es' });

    expect(svg).toContain('<svg');
    expect(svg).toContain('<title>Usuario no encontrado</title>');
    expect(svg).toContain('No se encontró el usuario @joaltoorc en GitHub.');
    expect(svg).toContain('Verifica la ortografía del usuario e intenta de nuevo.');
    expect(svg).not.toContain('https://api.github.com/users/joaltoorc');
    expect(svg).toContain('github.com/joaltoorc');
  });

  it('should handle 403 rate limit errors gracefully in Spanish for locale=es', () => {
    const rawError = 'GitHub API error (403) Rate limit exceeded';
    const svg = renderErrorCard(rawError, 'dark', { locale: 'es' });

    expect(svg).toContain('<title>Límite de API Alcanzado</title>');
    expect(svg).toContain('Se superó la cuota temporal de solicitudes a GitHub.');
    expect(svg).toContain('Configura un token personal de GitHub');
  });

  it('should render the 404 error card in English by default', () => {
    const rawError = 'GitHub API error (404) for URL https://api.github.com/users/joaltoorc';
    const svg = renderErrorCard(rawError, 'dark', { username: 'joaltoorc' });

    expect(svg).toContain('<title>User not found</title>');
    expect(svg).toContain('The user @joaltoorc was not found on GitHub.');
    expect(svg).not.toContain('Usuario no encontrado');
  });

  it('should render the rate limit error card in English by default', () => {
    const svg = renderErrorCard('GitHub API error (403) Rate limit exceeded', 'dark');

    expect(svg).toContain('<title>API limit reached</title>');
    expect(svg).toContain('Set a personal GitHub token');
  });

  it('should wrap long custom error messages into tspans without overflowing', () => {
    const longMessage =
      'Un mensaje extremadamente largo que supera los cuarenta y seis caracteres permitidos en una sola línea del SVG';
    const svg = renderErrorCard(longMessage, 'dark');

    expect(svg).toContain('<tspan');
    expect(svg).toContain('Un mensaje extremadamente largo que supera');
  });

  it('should XML-escape special characters in error inputs', () => {
    const maliciousMsg = '<script>alert("xss")</script>';
    const svg = renderErrorCard(maliciousMsg, 'dark');

    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;script&gt;');
  });

  it('should apply custom theme backgrounds when requested', () => {
    const svg = renderErrorCard('Error de prueba', 'tokyonight');
    expect(svg).toContain('#1a1b26');
  });
});
