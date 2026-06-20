import { ResourceType, AccessType } from "@/lib/constants";
import { Course } from "./course";
import { Category } from "./category";
import { User } from "./user";

export interface Resource {
  _id: string;
  title: string;
  description?: string;
  resource_type: ResourceType;           // v2.0: snake_case
  course?: Course | string;              // v2.0: now optional (decoupled from courses)
  category?: Category | string;          // v2.0: new field for standalone organization
  file_url?: string;
  is_active: boolean;
  createdAt: string;
  updatedAt?: string;
  // Legacy camelCase aliases
  type?: ResourceType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  accessType?: AccessType;
  uploadedBy?: User | string;
  downloads?: number;
  isActive?: boolean;
}
