import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { PublicBookingService } from '../services/public-booking.service';
import { Company } from '../models/salon.models';

export const bookingCompaniesResolver: ResolveFn<Company[]> = () =>
  inject(PublicBookingService).getCompanies();
