import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  LoggerService,
  UnauthorizedException,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { JwtGuard } from './jwt.guard';

@Injectable()
export class AdminGuard implements CanActivate {
  // constructor(private reflector: Reflector, private logger: LoggerService) {
  //   super();
  // }

  canActivate(context: ExecutionContext): boolean {
    // const allowed_role = this.reflector.get<Role>('role', context.getHandler());
    // if (!allowed_role) {
    //   return fal;
    // }
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    if (!user) {
      throw new UnauthorizedException();
    }

    if (checkRole(Role.ADMIN, user.role)) {
      return true;
    }
    return false;
  }
}
function checkRole(requiredRole: Role, assignedRole: Role) {
  if (requiredRole == Role.ADMIN && assignedRole == Role.USER) {
    return false;
  }

  return true;
}
