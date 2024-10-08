export interface UserInfo {
    userId: string;
    keyId: string;
    orgKeyId: string;
    orgId: string;
    userEmail: string;
    firstName: string;
    lastName: string;
    permission: {
        [key: string]: string;
    };
    allowedTeams : string[];
}
