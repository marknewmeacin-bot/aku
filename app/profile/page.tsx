import MyProfileComponent from "@/components/shared/profile";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile Page | VibeCart",
  description: "View Profile Page.",
};

const ProfilePage = () => {
  return <MyProfileComponent />;
};

export default ProfilePage;