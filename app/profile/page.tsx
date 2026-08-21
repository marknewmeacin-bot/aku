"use client";

import { useState, type ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Package,
  Key,
  UserCircle,
  RotateCcw,
  Heart,
} from "lucide-react";

type TabKey =
  | "Orders"
  | "Change Password"
  | "Change Details"
  | "Refunded Orders"
  | "Wishlist";

export default function MyAccount() {
  const [activeTab, setActiveTab] = useState<TabKey>("Orders");

  const tabContent: Record<TabKey, ReactNode> = {
    Orders: (
      <Card>
        <CardHeader>
          <CardTitle>Your Orders</CardTitle>
          <CardDescription>
            View and manage your order history
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[300px]">
            {[1, 2, 3, 4, 5].map((order) => (
              <div key={order} className="mb-4 rounded border p-4">
                <h3 className="font-semibold">Order #{order}</h3>
                <p>Date: {new Date().toLocaleDateString()}</p>
                <p>Status: Shipped</p>

                <Button variant="outline" size="sm" className="mt-2">
                  View Details
                </Button>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    ),

    "Change Password": (
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>

        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="currentPassword">
                  Current Password
                </Label>
                <Input id="currentPassword" type="password" />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="confirmPassword">
                  Confirm New Password
                </Label>
                <Input id="confirmPassword" type="password" />
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter>
          <Button>Update Password</Button>
        </CardFooter>
      </Card>
    ),

    "Change Details": (
      <Card>
        <CardHeader>
          <CardTitle>Change Details</CardTitle>
          <CardDescription>
            Update your account information
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter>
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
    ),

    "Refunded Orders": (
      <Card>
        <CardHeader>
          <CardTitle>Refunded Orders</CardTitle>
          <CardDescription>View your refunded orders</CardDescription>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[300px]">
            {[1, 2].map((order) => (
              <div key={order} className="mb-4 rounded border p-4">
                <h3 className="font-semibold">Refund #{order}</h3>
                <p>Date: {new Date().toLocaleDateString()}</p>
                <p>Status: Processed</p>

                <Button variant="outline" size="sm" className="mt-2">
                  View Details
                </Button>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    ),

    Wishlist: (
      <Card>
        <CardHeader>
          <CardTitle>Your Wishlist</CardTitle>
          <CardDescription>Manage your saved items</CardDescription>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[300px]">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="mb-4 flex items-center justify-between rounded border p-4"
              >
                <div>
                  <h3 className="font-semibold">Product {item}</h3>
                  <p>$99.99</p>
                </div>

                <Button variant="outline" size="sm">
                  Add to Cart
                </Button>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    ),
  };

  const tabIcons: Record<TabKey, ReactNode> = {
    Orders: <Package className="h-4 w-4" />,
    "Change Password": <Key className="h-4 w-4" />,
    "Change Details": <UserCircle className="h-4 w-4" />,
    "Refunded Orders": <RotateCcw className="h-4 w-4" />,
    Wishlist: <Heart className="h-4 w-4" />,
  };

  const tabKeys = Object.keys(tabContent) as TabKey[];

  return (
    <div className="container mx-auto p-4">
      <h1 className="heading mb-[20px] text-center">
        My Account
      </h1>

      <Tabs
        value={activeTab}
        className="w-full"
        onValueChange={(value) => setActiveTab(value as TabKey)}
      >
        <div className="flex flex-col gap-6 md:flex-row">
          <TabsList className="h-full justify-start bg-muted/50 p-1 md:w-48 md:flex-col md:p-2">
            {tabKeys.map((key) => (
              <TabsTrigger
                key={key}
                value={key}
                className="w-full justify-start gap-2 md:mb-2"
              >
                {tabIcons[key]}

                <span className="hidden md:inline">
                  {key}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1">
            {tabKeys.map((key) => (
              <TabsContent
                key={key}
                value={key}
                className="mt-0"
              >
                {tabContent[key]}
              </TabsContent>
            ))}
          </div>
        </div>
      </Tabs>
    </div>
  );
}