import { Injectable } from '@nestjs/common';
import { IGitHubRepository } from '@/domain/repositories/IGitHubRepository';
import { ITokenRepository } from '@/domain/repositories/ITokenRepository';
import {
  encryptToken,
  validateTokenScopes,
  generateConsentFingerprint
} from '@/infrastructure/security/security';

@Injectable()
export class RegisterUserTokenUseCase {
  constructor(
    private readonly tokenRepo: ITokenRepository,
    private readonly githubRepo: IGitHubRepository
  ) {}

  async execute(
    username: string,
    token: string,
    consentAccepted: boolean,
    ip: string,
    userAgent: string
  ): Promise<{ message: string }> {
    if (consentAccepted !== true) {
      throw new Error('You must accept the data storage terms and conditions.');
    }

    const validation = await validateTokenScopes(token);
    if (!validation.valid) {
      throw new Error(
        validation.reason || 'Invalid GitHub token or token with too many permissions.'
      );
    }

    const { encryptedToken, iv } = encryptToken(token);
    const fingerprint = generateConsentFingerprint(ip, userAgent);
    const consentDate = new Date().toISOString();

    await this.tokenRepo.saveToken({
      username,
      encryptedToken,
      iv,
      consentAccepted,
      consentDate,
      consentFingerprint: fingerprint
    });

    // Clear caches to force reloading with the new private token
    await this.githubRepo.clearCache(username);

    return {
      message:
        'Token registered successfully. Your private statistics will now be included on your cards.'
    };
  }
}
