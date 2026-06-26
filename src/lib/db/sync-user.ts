import { adminDb } from "../firebase/admin";
import { User } from "@/types";

export async function syncUserToFirestore(
  clerkId: string,
  email: string,
  name: string,
  avatar: string
): Promise<User> {
  const userRef = adminDb.collection("users").doc(clerkId);
  const doc = await userRef.get();

  const now = new Date();

  if (!doc.exists) {
    // Check if it's the first user ever, or if we want to assign admin manually
    // For convenience in testing, let's make the user admin if the email matches a specific one,
    // or keep it customer by default. Let's keep customer default.
    const newUser = {
      clerkId,
      name: name || "AltarVision User",
      email: email || "",
      avatar: avatar || "",
      role: "customer" as const,
      createdAt: now,
    };
    await userRef.set(newUser);
    return { id: clerkId, ...newUser } as User;
  } else {
    const existingData = doc.data();
    const updatedUser = {
      name: name || existingData?.name || "AltarVision User",
      email: email || existingData?.email || "",
      avatar: avatar || existingData?.avatar || "",
    };
    await userRef.update(updatedUser);
    return { id: clerkId, ...existingData, ...updatedUser } as User;
  }
}
