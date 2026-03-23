import { Injectable } from '@nestjs/common';
import { FileMakerService } from '../../filemaker/filemaker.service';
//import type { FindRecordsResult } from '../../interfaces/filemaker.interface';

@Injectable()
export class salesReportService {
  constructor(private readonly fmService: FileMakerService) {}
}
