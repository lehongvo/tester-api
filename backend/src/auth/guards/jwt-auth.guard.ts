import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    console.log('JwtAuthGuard - path:', request.url, 'method:', request.method);
    try {
      const result = super.canActivate(context);
      console.log('JwtAuthGuard - canActivate result:', result);
      return result;
    } catch (error) {
      console.error('JwtAuthGuard - Error:', error);
      throw error;
    }
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    console.log('JwtAuthGuard - handleRequest - err:', err, 'user:', user, 'info:', info);
    if (err || !user) {
      console.error('JwtAuthGuard - Authentication failed:', err || info);
      throw err || new Error('Authentication failed');
    }
    return user;
  }
}



