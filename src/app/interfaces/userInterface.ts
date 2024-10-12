export interface UserData {
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
  allowedTeams: string[];
}

export const userData: UserData = {
  userId: "",
  keyId: "",
  orgKeyId: "",
  orgId: "",
  userEmail: "",
  firstName: "",
  lastName: "",
  permission: {},
  allowedTeams: [],
};


export const loadUserData = () => {
  let storedUserData: string | null = null;
  if (typeof window !== "undefined") {
    storedUserData = sessionStorage.getItem('userData');
  }
  if (storedUserData) {
    Object.assign(userData, JSON.parse(storedUserData));
  }
};

// Function to update the user data object
export const updateUserData = (newData: Partial<UserData>) => {
  Object.assign(userData, newData);

  // Save the updated user data to session storage
  if (typeof window !== "undefined") {
    sessionStorage.setItem('userData', JSON.stringify(userData));
  }
};

// Initial load from session storage
loadUserData();
