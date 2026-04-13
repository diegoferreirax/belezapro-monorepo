const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    console.log('File not found:', filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  for (const [search, replace] of replacements) {
    content = content.split(search).join(replace);
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', filePath);
  }
}

// app.routes.ts
replaceInFile('src/app/app.routes.ts', [
  ["'./features/auth/admin.guard'", "'./core/guards/admin.guard'"],
  ["'./features/auth/client.guard'", "'./core/guards/client.guard'"],
  ["'./features/auth/auth-selection/auth-selection.component'", "'./features/public/auth-selection/auth-selection.component'"],
  ["'./features/auth/login/login.component'", "'./features/admin/login/login.component'"],
  ["'./features/booking/booking-page/booking-page.component'", "'./features/public/landing/booking-page.component'"],
  ["'./features/auth/otp-login/otp-login.component'", "'./features/client/login/otp-login.component'"],
  ["'./features/client/client-layout/client-layout.component'", "'./features/client/layout/client-layout.component'"],
  ["'./features/client/client-appointments/client-appointments.component'", "'./features/client/appointments/client-appointments.component'"],
  ["'./features/admin/admin-layout/admin-layout.component'", "'./features/admin/layout/admin-layout.component'"],
  ["'./features/appointments/appointments.component'", "'./features/admin/appointments/appointments.component'"],
  ["'./features/services/services.component'", "'./features/admin/services/services.component'"],
  ["'./features/client/clients.component'", "'./features/admin/clients/clients.component'"],
  ["'./features/schedule/schedule.component'", "'./features/admin/schedule/schedule.component'"]
]);

// core/guards/admin.guard.ts
replaceInFile('src/app/core/guards/admin.guard.ts', [
  ["'./auth.service'", "'../services/auth.service'"]
]);

// core/guards/client.guard.ts
replaceInFile('src/app/core/guards/client.guard.ts', [
  ["'./auth.service'", "'../services/auth.service'"]
]);

// features/admin/appointments/appointment-calendar/appointment-calendar.ts
replaceInFile('src/app/features/admin/appointments/appointment-calendar/appointment-calendar.ts', [
  ["'../../../core/models/salon.models'", "'../../../../core/models/salon.models'"],
  ["'../../../core/services/salon.service'", "'../../../../core/services/salon.service'"]
]);

// features/admin/appointments/appointment-list/appointment-list.ts
replaceInFile('src/app/features/admin/appointments/appointment-list/appointment-list.ts', [
  ["'../../../core/models/salon.models'", "'../../../../core/models/salon.models'"],
  ["'../../../core/pipes/duration-format.pipe'", "'../../../../shared/pipes/duration-format.pipe'"]
]);

// features/admin/appointments/appointments.component.ts
replaceInFile('src/app/features/admin/appointments/appointments.component.ts', [
  ["'../../core/services/salon.service'", "'../../../core/services/salon.service'"],
  ["'../../core/models/salon.models'", "'../../../core/models/salon.models'"],
  ["'../booking/booking-form/booking-form.component'", "'../../../shared/components/booking-form/booking-form.component'"]
]);

// features/admin/clients/clients.component.ts
replaceInFile('src/app/features/admin/clients/clients.component.ts', [
  ["'../../core/services/salon.service'", "'../../../core/services/salon.service'"],
  ["'../../core/models/salon.models'", "'../../../core/models/salon.models'"],
  ["'../../shared/directives/email-mask.directive'", "'../../../shared/directives/email-mask.directive'"],
  ["'../booking/booking-form/booking-form.component'", "'../../../shared/components/booking-form/booking-form.component'"]
]);

// features/admin/layout/admin-layout.component.ts
replaceInFile('src/app/features/admin/layout/admin-layout.component.ts', [
  ["'../../auth/auth.service'", "'../../../core/services/auth.service'"]
]);

// features/admin/login/login.component.ts
replaceInFile('src/app/features/admin/login/login.component.ts', [
  ["'../auth.service'", "'../../../core/services/auth.service'"]
]);

// features/admin/schedule/schedule.component.ts
replaceInFile('src/app/features/admin/schedule/schedule.component.ts', [
  ["'../../core/services/salon.service'", "'../../../core/services/salon.service'"],
  ["'../../core/models/salon.models'", "'../../../core/models/salon.models'"]
]);

// features/admin/services/services.component.ts
replaceInFile('src/app/features/admin/services/services.component.ts', [
  ["'../../core/services/salon.service'", "'../../../core/services/salon.service'"],
  ["'../../core/models/salon.models'", "'../../../core/models/salon.models'"],
  ["'../../core/pipes/duration-format.pipe'", "'../../../shared/pipes/duration-format.pipe'"]
]);

// features/client/appointments/client-appointments.component.ts
replaceInFile('src/app/features/client/appointments/client-appointments.component.ts', [
  ["'../../auth/auth.service'", "'../../../core/services/auth.service'"],
  ["'../../../core/pipes/duration-format.pipe'", "'../../../shared/pipes/duration-format.pipe'"],
  ["'../../booking/booking-form/booking-form.component'", "'../../../shared/components/booking-form/booking-form.component'"]
]);

// features/client/layout/client-layout.component.ts
replaceInFile('src/app/features/client/layout/client-layout.component.ts', [
  ["'../../auth/auth.service'", "'../../../core/services/auth.service'"]
]);

// features/client/login/otp-login.component.ts
replaceInFile('src/app/features/client/login/otp-login.component.ts', [
  ["'../auth.service'", "'../../../core/services/auth.service'"]
]);

// features/public/landing/booking-page.component.ts
replaceInFile('src/app/features/public/landing/booking-page.component.ts', [
  ["'../booking-form/booking-form.component'", "'../../../shared/components/booking-form/booking-form.component'"],
  ["'../../auth/auth.service'", "'../../../core/services/auth.service'"]
]);

// shared/components/booking-form/booking-form.component.ts
replaceInFile('src/app/shared/components/booking-form/booking-form.component.ts', [
  ["'../../auth/auth.service'", "'../../../core/services/auth.service'"],
  ["'../../../core/pipes/duration-format.pipe'", "'../../pipes/duration-format.pipe'"],
  ["'../../../shared/directives/email-mask.directive'", "'../../directives/email-mask.directive'"]
]);
