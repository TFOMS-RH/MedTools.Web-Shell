// MedTools.Identity.API: Common/Models/Dtos/UserDto.cs
export interface AuthUser {
  id: string;
  organizationId: string;
  userName: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  contactPhone: string | null;
  email: string | null;
  birthDate: string | null;
}
