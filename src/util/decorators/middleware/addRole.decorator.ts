import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';
//! unused
export const AddRole = (role: Role) => SetMetadata('role', role);
