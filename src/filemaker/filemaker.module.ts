import { Global, Module } from '@nestjs/common';
import { FileMakerService } from './filemaker.service';

@Global() // @Global hace que FileMakerService esté disponible en toda la app sin tener que importarlo en cada módulo
@Module({
  providers: [FileMakerService],
  exports: [FileMakerService], // Lo exportamos para que otros módulos lo puedan usar
})
export class FileMakerModule {}
