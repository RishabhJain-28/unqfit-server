import { Body, Controller, Get, Post } from '@nestjs/common';

@Controller('health-check')
export class HealthCheckController {
  @Get()
  async healthCheck() {
    // await new Promise((resolve) => {
    //   setTimeout(() => resolve(true), 1000);
    // }); //!remove
    return true; //! implement proper health check
    // return { data: `hello ${Math.random()}` };
  }
}
