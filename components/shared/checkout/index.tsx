"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Ticket,
  CreditCard,
  CheckCircle,
  Loader,
} from "lucide-react";
import { useForm } from "@mantine/form";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FaArrowAltCircleRight } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

import {
  applyCoupon,
  saveAddress,
} from "@/lib/database/actions/user.actions";

import { createOrder } from "@/lib/database/actions/order.actions";

import { getSavedCartForUser } from "@/lib/database/actions/cart.actions";

import { useCartStore } from "@/store/cart";

import DeliveryAddressForm from "./delivery.address.form";
import ApplyCouponForm from "./apply.coupon.form";

export default function CheckoutComponent() {
  const router = useRouter();
  const { userId } = useAuth();

  const [step, setStep] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);
  const [data, setData] = useState<any>({});

  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState("");

  const [totalAfterDiscount, setTotalAfterDiscount] = useState("");
  const [discount, setDiscount] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placeOrderLoading, setPlaceOrderLoading] = useState(false);

  const cart = useCartStore((state: any) => state.cart.cartItems);
  const { emptyCart } = useCartStore();

  const form = useForm({
    initialValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      state: "",
      city: "",
      zipCode: "",
      address1: "",
      address2: "",
      country: "",
    },

    validate: {
      firstName: (value) =>
        value.trim().length < 2
          ? "First name must be at least 2 letters."
          : null,

      lastName: (value) =>
        value.trim().length < 2
          ? "Last name must be at least 2 letters."
          : null,

      phoneNumber: (value) =>
        !/^\d{10}$/.test(value)
          ? "Phone number must contain 10 digits."
          : null,

      state: (value) =>
        value.trim().length < 2
          ? "State must be at least 2 letters."
          : null,

      city: (value) =>
        value.trim().length < 2
          ? "City must be at least 2 letters."
          : null,

      zipCode: (value) =>
        value.trim().length < 6
          ? "Zip code must be at least 6 characters."
          : null,

      address1: (value) =>
        value.length > 100
          ? "Address 1 must not exceed 100 characters."
          : null,

      address2: (value) =>
        value.length > 100
          ? "Address 2 must not exceed 100 characters."
          : null,
    },
  });

  // Load cart, user and address
  useEffect(() => {
    if (!userId) return;

    const fetchCheckoutData = async () => {
      try {
        const res = await getSavedCartForUser(userId);

        setData(res?.cart || {});
        setUser(res?.user || null);
        setAddress(res?.address || null);
      } catch (error) {
        console.error("Failed to load checkout data:", error);
        toast.error("Failed to load checkout data.");
      }
    };

    fetchCheckoutData();
  }, [userId]);

  // Fill address form when address changes
  useEffect(() => {
    if (!address || Object.keys(address).length === 0) return;

    form.setValues({
      firstName: address.firstName || "",
      lastName: address.lastName || "",
      phoneNumber: address.phoneNumber || "",
      state: address.state || "",
      city: address.city || "",
      zipCode: address.zipCode || "",
      address1: address.address1 || "",
      address2: address.address2 || "",
      country: address.country || "",
    });
  }, [address]);

  // Rehydrate cart from local storage
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  const subTotal = cart.reduce(
    (total: number, item: any) =>
      total + Number(item.price || 0) * Number(item.qty || 0),
    0
  );

  const totalSaved = cart.reduce(
    (total: number, item: any) =>
      total + Number(item.saved || 0) * Number(item.qty || 0),
    0
  );

  const cartTotal = (subTotal + totalSaved).toFixed(0);

  const nextStep = () => {
    setStep((current) => Math.min(current + 1, 3));
  };

  const prevStep = () => {
    setStep((current) => Math.max(current - 1, 1));
  };

  const isStepCompleted = (currentStep: number) =>
    step > currentStep;

  const isActiveStep = (currentStep: number) =>
    step === currentStep;

  // Apply coupon
  const applyCouponHandler = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!user?._id) {
      toast.error("User not found.");
      return;
    }

    if (!coupon.trim()) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    try {
      setCouponError("");

      const res = await applyCoupon(
        coupon.trim(),
        user._id
      );

      if (!res?.success) {
        toast.error(
          res?.message || "No coupon found."
        );
        return;
      }

      setTotalAfterDiscount(
        res.totalAfterDiscount || ""
      );

      setDiscount(res.discount || 0);

      toast.success(
        `Applied ${res.discount}% discount successfully.`
      );

      nextStep();
    } catch (error: any) {
      console.error("Coupon error:", error);

      setCouponError(
        error?.message || "Failed to apply coupon."
      );

      toast.error(
        error?.message || "Failed to apply coupon."
      );
    }
  };

  // Save address
  const handleAddressSubmit = async (values: any) => {
    if (!user?._id) {
      toast.error("User not found.");
      return;
    }

    try {
      const res = await saveAddress(
        {
          ...values,
          active: true,
        },
        user._id
      );

      if (!res?.success) {
        toast.error(res?.message || "Failed to save address.");
        return;
      }

      const savedAddress = res?.address || values;
      setAddress(savedAddress);
      setUser((currentUser: any) => ({
        ...currentUser,
        address: savedAddress,
      }));

      toast.success("Successfully added address.");

      router.refresh();

      nextStep();
    } catch (error: any) {
      console.error("Address error:", error);

      toast.error(
        error?.message || "Failed to save address."
      );
    }
  };

  // Place order
  const placeOrderHandler = async () => {
    try {
      setPlaceOrderLoading(true);

      if (!user?._id) {
        toast.error("User not found.");
        return;
      }

      if (!user?.address?.firstName) {
        toast.error(
          "Please fill in all details in the billing address."
        );
        return;
      }

      const finalTotal =
        totalAfterDiscount !== ""
          ? totalAfterDiscount
          : data?.cartTotal;

      const orderResponse = await createOrder(
        data?.products,
        user.address,
        "cod",
        finalTotal,
        data?.cartTotal,
        coupon,
        user._id,
        totalSaved
      );

      if (!orderResponse?.success) {
        toast.error(
          orderResponse?.message ||
            "Order creation failed."
        );
        return;
      }

      emptyCart();

      toast.success("Order placed successfully!");

      router.replace(
        `/order/${orderResponse.orderId}`
      );
    } catch (error) {
      console.error(
        "Error placing order:",
        error
      );

      toast.error(
        "An error occurred. Please try again."
      );
    } finally {
      setPlaceOrderLoading(false);
    }
  };

  const isDisabled =
    !user?.address?.firstName ||
    placeOrderLoading;

  const buttonText = () => {
    if (!user?.address?.firstName) {
      return "Please Add Billing Address";
    }

    return "Place Order with COD";
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">
        CHECKOUT
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* LEFT SIDE */}
        <div className="w-full lg:w-2/3">

          {/* Stepper */}
          <div className="relative flex items-center justify-between mb-8">

            {/* Step 1 */}
            <div className="relative flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isActiveStep(1)
                    ? "bg-primary text-white border-primary"
                    : isStepCompleted(1)
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-gray-200 text-gray-500 border-gray-300"
                }`}
              >
                {isStepCompleted(1) ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <MapPin className="w-5 h-5" />
                )}
              </div>

              <span className="mt-2 text-sm">
                <span className="hidden lg:block">
                  Delivery Address
                </span>
              </span>
            </div>

            <div
              className={`flex-1 border-t-2 mx-4 ${
                step >= 2
                  ? "border-primary"
                  : "border-gray-300"
              }`}
            />

            {/* Step 2 */}
            <div className="relative flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isActiveStep(2)
                    ? "bg-primary text-white border-primary"
                    : isStepCompleted(2)
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-gray-200 text-gray-500 border-gray-300"
                }`}
              >
                {isStepCompleted(2) ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Ticket className="w-5 h-5" />
                )}
              </div>

              <span className="mt-2 text-sm">
                <span className="hidden lg:block">
                  Apply Coupon
                </span>
              </span>
            </div>

            <div
              className={`flex-1 border-t-2 mx-4 ${
                step >= 3
                  ? "border-primary"
                  : "border-gray-300"
              }`}
            />

            {/* Step 3 */}
            <div className="relative flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isActiveStep(3)
                    ? "bg-primary text-white border-primary"
                    : isStepCompleted(3)
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-gray-200 text-gray-500 border-gray-300"
                }`}
              >
                {isStepCompleted(3) ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <CreditCard className="w-5 h-5" />
                )}
              </div>

              <span className="mt-2 text-sm">
                <span className="hidden lg:block">
                  Choose Payment Method
                </span>
              </span>
            </div>
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <form
              id="billing-address-form"
              onSubmit={form.onSubmit(
                handleAddressSubmit
              )}
              className="space-y-4"
            >
              <DeliveryAddressForm form={form} />
            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form
              onSubmit={applyCouponHandler}
              className="space-y-4"
            >
              <ApplyCouponForm
                setCoupon={setCoupon}
                couponError={couponError}
              />
            </form>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">
                Choose Payment Method
              </h2>

              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="cod"
                    id="cod"
                  />

                  <Label htmlFor="cod">
                    Cash on Delivery (COD)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex justify-between">
            {step > 1 && (
              <Button
                onClick={prevStep}
                variant="outline"
              >
                Previous
              </Button>
            )}

            {step < 3 && (
              <Button
                type={step === 1 ? "submit" : "button"}
                form={step === 1 ? "billing-address-form" : undefined}
                onClick={step === 1 ? undefined : nextStep}
                className="ml-auto"
              >
                Continue
              </Button>
            )}
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="w-full bg-gray-100 lg:w-1/3 lg:sticky top-[1rem] self-start">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Order Summary
            </h2>

            <div className="space-y-4">
              {data?.products?.map(
                (item: any, index: number) => (
                  <div
                    className="flex items-center space-x-4"
                    key={index}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 shrink-0 object-cover sm:h-20 sm:w-20"
                    />

                    <div>
                      <h3 className="font-medium text-sm">
                        {item.name}
                      </h3>

                      <p className="text-sm text-muted-foreground">
                        Size: {item.size}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Qty: {item.qty}
                      </p>

                      <p className="font-semibold text-sm">
                        ₹ {item.price} × {item.qty} = ₹{" "}
                        {item.price * item.qty}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* TOTALS */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between">
                <span>
                  Subtotal (
                  {data?.products?.length || 0}{" "}
                  {data?.products?.length === 1
                    ? "Item"
                    : "Items"}
                  ):
                </span>

                <strong>₹ {cartTotal}</strong>
              </div>

              <div className="flex justify-between text-green-600">
                <span>Cart Discount:</span>

                <strong>
                  - ₹ {totalSaved}
                </strong>
              </div>

              <div className="flex justify-between text-green-600">
                <span>Shipping Charges:</span>
                <span>Free</span>
              </div>

              <div
                className={`flex justify-between ${
                  totalAfterDiscount
                    ? "text-sm"
                    : "text-lg font-semibold"
                }`}
              >
                <span>
                  {totalAfterDiscount
                    ? "Total:"
                    : "Total before:"}
                </span>

                <span>
                  ₹ {data?.cartTotal}
                </span>
              </div>

              {discount > 0 && (
                <div className="bg-green-700 text-white p-2 text-sm flex justify-between">
                  <span>Coupon applied:</span>

                  <strong>
                    - {discount}%
                  </strong>
                </div>
              )}

              {totalAfterDiscount &&
                Number(totalAfterDiscount) <
                  Number(data?.cartTotal) && (
                  <div className="p-2 text-lg flex justify-between border">
                    <span>
                      Total after Discount:
                    </span>

                    <strong className="text-sm">
                      ₹ {totalAfterDiscount}
                    </strong>
                  </div>
                )}
            </div>

            {/* PLACE ORDER */}
            <Button
              onClick={placeOrderHandler}
              disabled={isDisabled}
              className={`mt-4 flex justify-center gap-2 w-full h-[45px] bg-green-700 text-white ${
                isDisabled
                  ? "bg-gray-300 cursor-not-allowed"
                  : ""
              }`}
            >
              {placeOrderLoading ? (
                <div className="flex items-center gap-2">
                  <Loader className="animate-spin" />
                  Loading...
                </div>
              ) : (
                buttonText()
              )}

              <FaArrowAltCircleRight
                size={25}
                color="white"
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}