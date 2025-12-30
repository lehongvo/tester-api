import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/entities/user.entity';
import { Role } from '../auth/entities/role.enum';
import { Student } from '../student/entities/student.entity';
import { Course } from '../course/entities/course.entity';
import { AccountService } from '../account/account.service';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionType } from '../transaction/entities/transaction.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    private accountService: AccountService,
    private transactionService: TransactionService,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    console.log('🌱 Starting database seeding...');

    // 1. Create account for admin
    await this.seedAdminAccount();

    // 2. Create 10 students
    await this.seedStudents();

    // 3. Create 20 courses
    await this.seedCourses();

    console.log('✅ Database seeding completed!');
  }

  private async seedAdminAccount() {
    const admin = await this.userRepository.findOne({
      where: { username: 'admin' },
    });

    if (admin) {
      try {
        await this.accountService.getAccountByUserId(admin.id);
        console.log('✅ Admin account already exists');
      } catch (error) {
        // Admin doesn't have account, create one
        await this.accountService.createAccount(admin.id, 0);
        console.log('✅ Admin account created with 0 USD');
      }
    }
  }

  private async seedStudents() {
    const existingStudents = await this.userRepository.count({
      where: { role: Role.Student },
    });

    if (existingStudents >= 10) {
      console.log(`✅ Already have ${existingStudents} students`);
      return;
    }

    const studentsToCreate = 10 - existingStudents;
    console.log(`📚 Creating ${studentsToCreate} students...`);

    const studentNames = [
      'Nguyen Van A',
      'Tran Thi B',
      'Le Van C',
      'Pham Thi D',
      'Hoang Van E',
      'Vu Thi F',
      'Dang Van G',
      'Bui Thi H',
      'Do Van I',
      'Ngo Thi K',
    ];

    const emails = [
      'nguyenvana@school.edu',
      'tranthib@school.edu',
      'levanc@school.edu',
      'phamthid@school.edu',
      'hoangvane@school.edu',
      'vuthif@school.edu',
      'dangvang@school.edu',
      'buithih@school.edu',
      'dovani@school.edu',
      'ngothik@school.edu',
    ];

    for (let i = existingStudents; i < 10; i++) {
      const index = i;
      const username = `student${String(index + 1).padStart(3, '0')}`;
      const studentId = `SV${String(index + 1).padStart(3, '0')}`;
      const password = `student${index + 1}123`;

      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { username },
      });

      if (existingUser) {
        continue;
      }

      // Create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = this.userRepository.create({
        username,
        email: emails[index],
        fullName: studentNames[index],
        studentId,
        password: hashedPassword,
        role: Role.Student,
      });
      const savedUser = await this.userRepository.save(user);

      // Create student entity
      const student = this.studentRepository.create({
        name: studentNames[index],
        email: emails[index],
        age: 18 + (index % 5), // Age between 18-22
        address: `${index + 1} Main Street, Ho Chi Minh City`,
      });
      await this.studentRepository.save(student);

      // Create account with 10,000 USD
      await this.accountService.createAccount(savedUser.id, 10000);

      // Log initial balance transaction
      await this.transactionService.createTransaction(
        null,
        savedUser.id,
        10000,
        TransactionType.Adjustment,
        'Initial account balance',
      );

      console.log(`  ✅ Created student: ${username} (${studentId}) - Password: ${password}`);
    }
  }

  private async seedCourses() {
    const existingCourses = await this.courseRepository.count();

    if (existingCourses >= 20) {
      console.log(`✅ Already have ${existingCourses} courses`);
      return;
    }

    const coursesToCreate = 20 - existingCourses;
    console.log(`📖 Creating ${coursesToCreate} courses...`);

    const courses = [
      {
        name: 'Introduction to Programming',
        price: 500,
        description: 'Learn the fundamentals of programming with Python',
        instructor: 'Dr. John Smith',
        duration: '12 weeks',
      },
      {
        name: 'Web Development Fundamentals',
        price: 600,
        description: 'Build modern web applications with HTML, CSS, and JavaScript',
        instructor: 'Prof. Sarah Johnson',
        duration: '10 weeks',
      },
      {
        name: 'Database Management',
        price: 550,
        description: 'Master SQL and database design principles',
        instructor: 'Dr. Michael Chen',
        duration: '8 weeks',
      },
      {
        name: 'Data Structures and Algorithms',
        price: 700,
        description: 'Advanced algorithms and data structures',
        instructor: 'Prof. David Lee',
        duration: '14 weeks',
      },
      {
        name: 'Mobile App Development',
        price: 650,
        description: 'Build iOS and Android applications',
        instructor: 'Dr. Emily Brown',
        duration: '12 weeks',
      },
      {
        name: 'Machine Learning Basics',
        price: 800,
        description: 'Introduction to AI and machine learning',
        instructor: 'Prof. Robert Wilson',
        duration: '16 weeks',
      },
      {
        name: 'Cybersecurity Fundamentals',
        price: 750,
        description: 'Learn to protect systems from cyber threats',
        instructor: 'Dr. Lisa Anderson',
        duration: '10 weeks',
      },
      {
        name: 'Cloud Computing',
        price: 700,
        description: 'AWS, Azure, and cloud architecture',
        instructor: 'Prof. James Taylor',
        duration: '12 weeks',
      },
      {
        name: 'Software Engineering',
        price: 650,
        description: 'Software development lifecycle and best practices',
        instructor: 'Dr. Maria Garcia',
        duration: '14 weeks',
      },
      {
        name: 'UI/UX Design',
        price: 550,
        description: 'Design beautiful and user-friendly interfaces',
        instructor: 'Prof. Alex Martinez',
        duration: '10 weeks',
      },
      {
        name: 'DevOps and CI/CD',
        price: 750,
        description: 'Automate deployment and infrastructure',
        instructor: 'Dr. Chris Thompson',
        duration: '12 weeks',
      },
      {
        name: 'Blockchain Development',
        price: 900,
        description: 'Build decentralized applications',
        instructor: 'Prof. Kevin White',
        duration: '16 weeks',
      },
      {
        name: 'Game Development',
        price: 600,
        description: 'Create games with Unity',
        instructor: 'Dr. Rachel Green',
        duration: '14 weeks',
      },
      {
        name: 'Network Security',
        price: 700,
        description: 'Secure network infrastructure',
        instructor: 'Prof. Daniel Kim',
        duration: '10 weeks',
      },
      {
        name: 'Big Data Analytics',
        price: 850,
        description: 'Analyze large datasets with Hadoop and Spark',
        instructor: 'Dr. Jennifer Park',
        duration: '16 weeks',
      },
      {
        name: 'Full Stack Development',
        price: 800,
        description: 'Complete web development stack',
        instructor: 'Prof. Mark Davis',
        duration: '18 weeks',
      },
      {
        name: 'Python for Data Science',
        price: 650,
        description: 'Data analysis with Python and pandas',
        instructor: 'Dr. Laura Miller',
        duration: '12 weeks',
      },
      {
        name: 'React Advanced',
        price: 600,
        description: 'Advanced React patterns and hooks',
        instructor: 'Prof. Steven Clark',
        duration: '10 weeks',
      },
      {
        name: 'Node.js Backend Development',
        price: 650,
        description: 'Build scalable backend services',
        instructor: 'Dr. Amanda Lewis',
        duration: '12 weeks',
      },
      {
        name: 'Docker and Kubernetes',
        price: 750,
        description: 'Containerization and orchestration',
        instructor: 'Prof. Brian Walker',
        duration: '14 weeks',
      },
    ];

    for (let i = existingCourses; i < 20; i++) {
      const courseData = courses[i];
      const existingCourse = await this.courseRepository.findOne({
        where: { name: courseData.name },
      });

      if (existingCourse) {
        continue;
      }

      const course = this.courseRepository.create(courseData);
      await this.courseRepository.save(course);
      console.log(`  ✅ Created course: ${courseData.name} - $${courseData.price}`);
    }
  }
}

