import { IsIn, IsOptional } from 'class-validator';
import { ListQueryDto } from '../../framework/crud/list-query.dto.js';
import { EXCEPTION_TYPES, SEVERITIES } from './exception.model.js';

export class ExceptionQueryDto extends ListQueryDto {
  @IsOptional()
  @IsIn(EXCEPTION_TYPES as unknown as string[])
  type?: string;

  @IsOptional()
  @IsIn(SEVERITIES as unknown as string[])
  severity?: string;

  /** `true` for unresolved only, `false` for resolved only. */
  @IsOptional()
  @IsIn(['true', 'false'])
  open?: string;
}

/** Exceptions are raised by services, never created through the API. */
export class CreateExceptionDto {}
