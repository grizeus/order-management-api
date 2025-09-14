import { Injectable } from '@nestjs/common';
import { name, version, description } from '../package.json';

@Injectable()
export class AppService {
  getServiceInfo() {
    return {
      version,
      name,
      description,
    };
  }
}
