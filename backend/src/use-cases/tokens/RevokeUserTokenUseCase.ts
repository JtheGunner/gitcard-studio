import { Injectable } from '@nestjs/common';
import { IGitHubRepository } from '@/domain/repositories/IGitHubRepository';
import { ITokenRepository } from '@/domain/repositories/ITokenRepository';

@Injectable()
export class RevokeUserTokenUseCase {
  constructor(
    private readonly tokenRepo: ITokenRepository,
    private readonly githubRepo: IGitHubRepository
  ) {}

  async execute(username: string, providedToken: string): Promise<{ message: string }> {
    // 1. Verify who owns the provided token
    const profileRes = await fetch('https://api.github.com/user', {
      headers: {
        'User-Agent': 'gitcard-studio-security',
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${providedToken}`
      }
    });

    if (!profileRes.ok) {
      throw new Error('The provided token is not valid. Your identity cannot be verified.');
    }

    const githubUser = await profileRes.json();
    const tokenOwner = githubUser.login;

    // 2. Enforce ownership: only the owner of the GitHub username can delete its token
    if (tokenOwner.toLowerCase() !== username.toLowerCase()) {
      throw new Error(
        `Access denied. The provided token belongs to the GitHub user '${tokenOwner}', but you are trying to revoke the token of '${username}'.`
      );
    }

    // 3. Check if token exists
    const existingToken = await this.tokenRepo.getToken(username);
    if (!existingToken) {
      throw new Error('No registered token was found for this user.');
    }

    // 4. Delete from database
    await this.tokenRepo.deleteToken(username);

    // 5. Clear caches
    await this.githubRepo.clearCache(username);

    return {
      message: 'Token revoked and deleted successfully from our servers.'
    };
  }
}
