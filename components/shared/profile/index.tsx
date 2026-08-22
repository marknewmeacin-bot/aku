"use client";

import { useEffect, useState } from "react";
import { ChevronRight, LogOut } from "lucide-react";
import { useAuth, useClerk, UserProfile } from "@clerk/nextjs";
import { useForm } from "@mantine/form";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import {
  getAllUserOrdersProfile,
  getUserById,
  saveAddress,
} from "@/lib/database/actions/user.actions";

import { getSavedCartForUser } from "@/lib/database/actions/cart.actions";

interface UserData {
  name: string;
  email: string;
  avatar: string;
  id: string;
}

interface Address {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  address1?: string;
  address2?: string;
  country?: string;
}

interface AddressFormValues {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  state: string;
  city: string;
  zipCode: string;
  address1: string;
  address2: string;
  country: string;
}

const initialAddressValues: AddressFormValues = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  state: "",
  city: "",
  zipCode: "",
  address1: "",
  address2: "",
  country: "",
};

const MyProfileComponent = () => {
  const { userId } = useAuth();
  const { signOut } = useClerk();

  const [orders, setOrders] = useState<any[]>([]);
  const [address, setAddress] = useState<Address | null>(null);

  const [user, setUser] = useState<UserData>({
    name: "",
    email: "",
    avatar: "",
    id: "",
  });

  const form = useForm<AddressFormValues>({
    initialValues: initialAddressValues,

    validate: {
      firstName: (value) =>
        value.trim().length < 2
          ? "First name must be at least 2 characters."
          : null,

      lastName: (value) =>
        value.trim().length < 2
          ? "Last name must be at least 2 characters."
          : null,

      phoneNumber: (value) =>
        !/^\d{10}$/.test(value.trim())
          ? "Phone number must contain exactly 10 digits."
          : null,

      state: (value) =>
        value.trim().length < 2
          ? "State must be at least 2 characters."
          : null,

      city: (value) =>
        value.trim().length < 2
          ? "City must be at least 2 characters."
          : null,

      zipCode: (value) =>
        !/^\d{6}$/.test(value.trim())
          ? "Zip code must contain 6 digits."
          : null,

      address1: (value) =>
        !value.trim()
          ? "Address 1 is required."
          : value.length > 100
            ? "Address 1 cannot exceed 100 characters."
            : null,

      address2: (value) =>
        value.length > 100
          ? "Address 2 cannot exceed 100 characters."
          : null,

      country: (value) =>
        value.trim().length < 2
          ? "Country is required."
          : null,
    },
  });

  /* --------------------------------------------------
     Fetch Orders
  -------------------------------------------------- */

  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        const res = await getAllUserOrdersProfile(userId);

        if (!res?.success) {
          toast.error(
            res?.message || "Failed to fetch orders."
          );
          return;
        }

        setOrders(Array.isArray(res.orders) ? res.orders : []);
      } catch (error: any) {
        console.error("FETCH ORDERS ERROR:", error);

        toast.error(
          error?.message || "Failed to fetch orders."
        );
      }
    };

    fetchOrders();
  }, [userId]);

  /* --------------------------------------------------
     Fetch User
  -------------------------------------------------- */

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const res = await getUserById(userId);

        if (!res?.success) {
          toast.error(
            res?.message || "Failed to fetch user."
          );
          return;
        }

        setUser({
          name: res.user?.username || "",
          email: res.user?.email || "",
          avatar: res.user?.image || "",
          id: res.user?._id || "",
        });
      } catch (error: any) {
        console.error("FETCH USER ERROR:", error);

        toast.error(
          error?.message || "Failed to fetch user."
        );
      }
    };

    fetchUser();
  }, [userId]);

  /* --------------------------------------------------
     Fetch Saved Address
  -------------------------------------------------- */

  useEffect(() => {
    if (!userId) return;

    const fetchAddress = async () => {
      try {
        const res = await getSavedCartForUser(userId);

        const savedAddress = res?.address || null;

        setAddress(savedAddress);

        if (savedAddress) {
          form.setValues({
            firstName: savedAddress.firstName || "",
            lastName: savedAddress.lastName || "",
            phoneNumber: savedAddress.phoneNumber || "",
            state: savedAddress.state || "",
            city: savedAddress.city || "",
            zipCode: savedAddress.zipCode || "",
            address1: savedAddress.address1 || "",
            address2: savedAddress.address2 || "",
            country: savedAddress.country || "",
          });
        }
      } catch (error: any) {
        console.error("FETCH ADDRESS ERROR:", error);

        toast.error(
          error?.message || "Failed to fetch address."
        );
      }
    };

    fetchAddress();
  }, [userId]);

  /* --------------------------------------------------
     Save Address
  -------------------------------------------------- */

  const handleSaveAddress = async (
    values: AddressFormValues
  ) => {
    if (!user.id) {
      toast.error("User not found.");
      return;
    }

    try {
      const res = await saveAddress(
        {
          ...values,
          active: true,
        },
        user.id
      );

      if (!res?.success) {
        toast.error(
          res?.message || "Failed to save address."
        );
        return;
      }

      setAddress(res.addresses || null);

      toast.success("Address saved successfully.");
    } catch (error: any) {
      console.error("SAVE ADDRESS ERROR:", error);

      toast.error(
        error?.message || "Failed to save address."
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-[50px] text-center text-2xl font-bold">
        MY PROFILE
      </h1>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Sidebar */}
        <aside className="w-full self-start md:sticky md:top-4 md:w-1/4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user.avatar}
                    alt={user.name}
                  />

                  <AvatarFallback>
                    {user.name
                      ? user.name.charAt(0).toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <CardTitle className="truncate capitalize">
                    {user.name || "User"}
                  </CardTitle>

                  <CardDescription className="truncate">
                    {user.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardFooter>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() =>
                  signOut({
                    redirectUrl: "/sign-in",
                  })
                }
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </CardFooter>
          </Card>
        </aside>

        {/* Main */}
        <main className="flex-1">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">
                Profile
              </TabsTrigger>

              <TabsTrigger value="orders">
                Orders
              </TabsTrigger>

              <TabsTrigger value="billing">
                Billing
              </TabsTrigger>
            </TabsList>

            {/* Profile */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>

                  <CardDescription>
                    Update your profile details here.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0 sm:p-6">
                  <UserProfile />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>

                  <CardDescription>
                    View your past orders and their status.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No orders found.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between border-b pb-3"
                        >
                          <div>
                            <p className="font-medium">
                              {order.id}
                            </p>

                            <p className="text-sm text-gray-500">
                              {order.date}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-medium">
                              ₹
                              {Number(
                                order.total || 0
                              ).toFixed(2)}
                            </p>

                            <Link
                              href={`/order/${order.id}`}
                              className="flex items-center gap-0 text-sm text-blue-500 underline"
                            >
                              See Details
                              <ChevronRight size={15} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing */}
            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Address</CardTitle>

                  <CardDescription>
                    Update your billing address details here.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <form
                    onSubmit={form.onSubmit(
                      handleSaveAddress
                    )}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="firstName">
                          First Name
                        </label>

                        <Input
                          id="firstName"
                          placeholder="First Name"
                          {...form.getInputProps(
                            "firstName"
                          )}
                        />
                      </div>

                      <div>
                        <label htmlFor="lastName">
                          Last Name
                        </label>

                        <Input
                          id="lastName"
                          placeholder="Last Name"
                          {...form.getInputProps(
                            "lastName"
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phoneNumber">
                        Phone Number
                      </label>

                      <Input
                        id="phoneNumber"
                        placeholder="Phone Number"
                        {...form.getInputProps(
                          "phoneNumber"
                        )}
                      />
                    </div>

                    <div>
                      <label htmlFor="state">
                        State
                      </label>

                      <Input
                        id="state"
                        placeholder="State"
                        {...form.getInputProps("state")}
                      />
                    </div>

                    <div>
                      <label htmlFor="city">
                        City
                      </label>

                      <Input
                        id="city"
                        placeholder="City"
                        {...form.getInputProps("city")}
                      />
                    </div>

                    <div>
                      <label htmlFor="zipCode">
                        Zip Code / Postal Code
                      </label>

                      <Input
                        id="zipCode"
                        placeholder="Zip Code / Postal Code"
                        {...form.getInputProps(
                          "zipCode"
                        )}
                      />
                    </div>

                    <div>
                      <label htmlFor="address1">
                        Address 1
                      </label>

                      <Input
                        id="address1"
                        placeholder="Address 1"
                        {...form.getInputProps(
                          "address1"
                        )}
                      />
                    </div>

                    <div>
                      <label htmlFor="address2">
                        Address 2
                      </label>

                      <Input
                        id="address2"
                        placeholder="Address 2"
                        {...form.getInputProps(
                          "address2"
                        )}
                      />
                    </div>

                    <div>
                      <label htmlFor="country">
                        Country
                      </label>

                      <Input
                        id="country"
                        placeholder="Country"
                        {...form.getInputProps(
                          "country"
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                    >
                      Save Address
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default MyProfileComponent;