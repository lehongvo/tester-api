import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    // Ensure userId is a number
    let userId: number;
    if (typeof payload.sub === 'number') {
      userId = payload.sub;
    } else if (typeof payload.sub === 'string') {
      userId = parseInt(payload.sub, 10);
    } else {
      console.error('Invalid payload.sub:', payload.sub, typeof payload.sub);
      // Return null to let guard handle authentication failure
      return null;
    }
    
    if (isNaN(userId) || userId <= 0) {
      console.error('Invalid userId after parsing:', userId, 'from payload.sub:', payload.sub);
      // Return null to let guard handle authentication failure
      return null;
    }
    
    console.log('JWT validate - userId:', userId, 'username:', payload.username, 'role:', payload.role);
    
    return { 
      userId: userId,
      sub: userId, // Keep sub for backward compatibility
      username: payload.username,
      role: payload.role,
    };
  }
}

