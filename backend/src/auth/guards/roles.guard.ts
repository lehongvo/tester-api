import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../entities/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      console.log('RolesGuard - requiredRoles:', requiredRoles);
      if (!requiredRoles) {
        console.log('RolesGuard - No required roles, allowing access');
        return true;
      }
      const { user } = context.switchToHttp().getRequest();
      const request = context.switchToHttp().getRequest();
      console.log('RolesGuard - path:', request.url, 'user:', JSON.stringify(user), 'requiredRoles:', requiredRoles);
      if (!user) {
        console.error('RolesGuard - No user found in request');
        return false;
      }
      const hasRole = requiredRoles.some((role) => user?.role === role);
      console.log('RolesGuard - hasRole:', hasRole, 'user.role:', user?.role);
      return hasRole;
    } catch (error) {
      console.error('RolesGuard - Error:', error);
      throw error;
    }
  }
}

