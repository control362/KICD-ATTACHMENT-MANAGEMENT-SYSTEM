export interface User {
  userId: number;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Department {
  departmentId: number;
  name: string;
  code?: string;
}

export interface ApplicantProfile {
  studentId: number;
  user: User;
  department?: Department;
  admissionNumber?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  university?: string;
  courseName?: string;
  yearOfStudy?: number;
  gpa?: number;
  bio?: string;
  profileCompleted?: boolean;
  idDocumentUrl?: string;
  resumeUrl?: string;
}

export interface OpportunityDocument {
  id?: number;
  documentName: string;
  isRequired: boolean;
}

export interface Opportunity {
  opportunityId: number;
  title: string;
  department: Department;
  description: string;
  requirements?: string;
  numberOfSlots: number;
  applicationDeadline: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'CANCELLED';
  type?: string;
  benefits?: string;
  duration?: string;
  location?: string;
  workArrangement?: string;
  startDate?: string;
  endDate?: string;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
  documents?: OpportunityDocument[];
}

export interface ApplicationDocument {
  id?: number;
  documentType: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface Application {
  applicationId: number;
  applicantProfile: ApplicantProfile;
  opportunity: Opportunity;
  status: 'DRAFT' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  resumeUrl?: string;
  idDocumentUrl?: string;
  submittedAt?: string;
  reviewedAt?: string;
  updatedAt?: string;
  approvalDate?: string;
  rejectionReason?: string;
  documents?: ApplicationDocument[];
}

export interface AuthResponse {
  accessToken: string;
  userId: number;
  email: string;
  role: string;
}
