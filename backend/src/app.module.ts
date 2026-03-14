import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { OrganizationModule } from './components/organization/organization.module';
import { OrganizationBranchModule } from './components/organization-branch/organization-branch.module';
import { ClassesModule } from './classes/classes.module';
import { SubjectsModule } from './subjects/subjects.module';
import { StudentsModule } from './students/students.module';
import { GradingModule } from './grading/grading.module';
import { PerformanceModule } from './performance/performance.module';
import { StaffModule } from './staff/staff.module';
import { TimetableModule } from './timetable/timetable.module';
import { PaymentsModule } from './payments/payments.module';
import { ApprovalsModule } from './approvals/approvals.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
    AuthModule,
    OrganizationModule,
    OrganizationBranchModule,
    ClassesModule,
    SubjectsModule,
    StudentsModule,
    GradingModule,
    PerformanceModule,
    StaffModule,
    TimetableModule,
    PaymentsModule,
    ApprovalsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
