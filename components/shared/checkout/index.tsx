
"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  CheckCircle,
  Loader,
  MapPin,
  Ticket,
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

import {
  createOrder,
  createStripeOrder,
} from "@/lib/database/actions/order.actions";

import { getSavedCartForUser } from "@/lib/database/actions/cart.actions";
import { useCartStore } from "@/store/cart";

import DeliveryAddressForm from "./delivery.address.form";
import ApplyCouponForm from "./apply.coupon.form";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Product = {
  product: string;
  name: string;
  image: string;
  size: string;
  qty: number;
  color: {
    color: string;
    image: string;
  };
  price: number;
  status: string;
  productCompletedAt: Date | null;
  _id: string;
  saved?: number;
};

type CheckoutData = {
  products: Product[];
  cartTotal: number;
};

type UserAddress = {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  address1?: string;
  address2?: string;
  country?: string;
  active?: boolean;
};

type UserData = {
  _id?: string;
  address?: UserAddress;
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function CheckoutComponent() {
  const router = useRouter();
  const { userId } = useAuth();

  const cart = useCartStore(
    (state: any) => state.cart.cartItems
  );

  const { emptyCart } = useCartStore();

  /* ------------------------------------------------------------------------ */
  /* State                                                                    */
  /* ------------------------------------------------------------------------ */

  const [step, setStep] = useState(1);

  const [user, setUser] =
    useState<UserData | null>(null);

  const [address, setAddress] =
    useState<UserAddress | null>(null);

  /*
   * IMPORTANT:
   * products is ALWAYS an array.
   * This fixes:
   * "any[] | undefined is not assignable to Product[]"
   */
  const [data, setData] = useState<CheckoutData>({
    products: [],
    cartTotal: 0,
  });

  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("cod");

  const [totalAfterDiscount, setTotalAfterDiscount] =
    useState("");

  const [discount, setDiscount] = useState(0);
  const [subTotal, setSubtotal] = useState(0);

  const [placeOrderLoading, setPlaceOrderLoading] =
    useState(false);

  /* ------------------------------------------------------------------------ */
  /* Checkout Form                                                            */
  /* ------------------------------------------------------------------------ */

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
        value.trim().length < 4
          ? "First name must be at least 4 letters"
          : null,

      lastName: (value) =>
        value.trim().length < 2
          ? "Last name must be at least 2 letters"
          : null,

      phoneNumber: (value) =>
        !/^\d{10}$/.test(value.trim())
          ? "Phone number must be 10 numbers"
          : null,

      state: (value) =>
        value.trim().length < 2
          ? "State must be at least 2 letters"
          : null,

      city: (value) =>
        value.trim().length < 2
          ? "City must be at least 2 letters"
          : null,

      zipCode: (value) =>
        value.trim().length < 6
          ? "Zip Code must be at least 6 characters"
          : null,

      address1: (value) =>
        value.trim().length > 100
          ? "Address 1 must not exceed 100 characters"
          : null,

      address2: (value) =>
        value.trim().length > 100
          ? "Address 2 must not exceed 100 characters"
          : null,
    },
  });

  /* ------------------------------------------------------------------------ */
  /* Load Checkout Data                                                       */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!userId) return;

    const loadCheckoutData = async () => {
      try {
        const result =
          await getSavedCartForUser(userId);

        setData({
          products: result?.cart?.products ?? [],
          cartTotal: Number(
            result?.cart?.cartTotal ?? 0
          ),
        });

        setUser(result?.user ?? null);
        setAddress(result?.address ?? null);
      } catch (error) {
        console.error(
          "Error loading checkout:",
          error
        );

        toast.error(
          "Unable to load checkout information."
        );
      }
    };

    loadCheckoutData();
  }, [userId]);

  /* ------------------------------------------------------------------------ */
  /* Load Saved Address                                                       */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!address) return;

    form.setValues({
      firstName: address.firstName ?? "",
      lastName: address.lastName ?? "",
      phoneNumber: address.phoneNumber ?? "",
      state: address.state ?? "",
      city: address.city ?? "",
      zipCode: address.zipCode ?? "",
      address1: address.address1 ?? "",
      address2: address.address2 ?? "",
      country: address.country ?? "",
    });
  }, [address, form]);

  /* ------------------------------------------------------------------------ */
  /* Calculate Subtotal                                                       */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const total = cart.reduce(
      (sum: number, item: any) =>
        sum +
        Number(item.price || 0) *
          Number(item.qty || 0),
      0
    );

    setSubtotal(Number(total.toFixed(2)));
  }, [cart]);

  /* ------------------------------------------------------------------------ */
  /* Rehydrate Cart                                                           */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Steps                                                                    */
  /* ------------------------------------------------------------------------ */

  const nextStep = () => {
    setStep((current) =>
      Math.min(current + 1, 3)
    );
  };

  const prevStep = () => {
    setStep((current) =>
      Math.max(current - 1, 1)
    );
  };

  const isCompleted = (currentStep: number) =>
    step > currentStep;

  const isActive = (currentStep: number) =>
    step === currentStep;

  /* ------------------------------------------------------------------------ */
  /* Apply Coupon                                                             */
  /* ------------------------------------------------------------------------ */

  const applyCouponHandler = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!user?._id) {
      toast.error(
        "User information is not available."
      );
      return;
    }

    const couponCode = coupon.trim();

    if (!couponCode) {
      setCouponError(
        "Please enter a coupon code."
      );

      toast.error(
        "Please enter a coupon code."
      );

      return;
    }

    try {
      const result = await applyCoupon(
        couponCode,
        user._id
      );

      if (!result.success) {
        setCouponError(result.message);
        toast.error(result.message);
        return;
      }

      setTotalAfterDiscount(
        result.totalAfterDiscount ?? ""
      );

      setDiscount(result.discount ?? 0);
      setCouponError("");

      toast.success(
        `Applied ${result.discount ?? 0}% discount successfully.`
      );

      nextStep();
    } catch (error) {
      console.error(
        "Error applying coupon:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to apply coupon.";

      setCouponError(message);
      toast.error(message);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Cart Totals                                                              */
  /* ------------------------------------------------------------------------ */

  const totalSaved = cart.reduce(
    (total: number, item: any) =>
      total +
      Number(item.saved || 0) *
        Number(item.qty || 0),
    0
  );

  const cartTotal = Number(
    subTotal + totalSaved
  ).toFixed(0);

  /* ------------------------------------------------------------------------ */
  /* Button State                                                             */
  /* ------------------------------------------------------------------------ */

  const isDisabled =
    !paymentMethod ||
    !user?.address?.firstName ||
    placeOrderLoading;

  const getButtonText = () => {
    if (!paymentMethod) {
      return "Please select the payment method";
    }

    if (!user?.address?.firstName) {
      return "Please Add Billing Address";
    }

    if (paymentMethod === "cod") {
      return "Place Order with COD";
    }

    return "Place Order with Stripe";
  };

  /* ------------------------------------------------------------------------ */
  /* Place Order                                                              */
  /* ------------------------------------------------------------------------ */

  const placeOrderHandler = async () => {
    if (placeOrderLoading) return;

    try {
      setPlaceOrderLoading(true);

      if (!paymentMethod) {
        toast.error(
          "Please choose a payment method."
        );
        return;
      }

      if (!user?.address?.firstName) {
        toast.error(
          "Please fill in all billing address details."
        );
        return;
      }

      /*
       * products is guaranteed to be Product[].
       * No more undefined error.
       */
      const products = data.products;

      const finalTotal =
        totalAfterDiscount ||
        String(data.cartTotal);

      /* -------------------------------------------------------------------- */
      /* Stripe                                                               */
      /* -------------------------------------------------------------------- */

      if (paymentMethod === "stripe") {
        const response =
          await createStripeOrder(
            products,
            user.address,
            paymentMethod,
            finalTotal,
            data.cartTotal,
            coupon,
            user._id!,
            totalSaved
          );

        if (!response?.sessionUrl) {
          toast.error(
            "Stripe session URL not found."
          );
          return;
        }

        window.location.href =
          response.sessionUrl;

        return;
      }

      /* -------------------------------------------------------------------- */
      /* COD                                                                  */
      /* -------------------------------------------------------------------- */

      const response = await createOrder(
        products,
        user.address,
        paymentMethod,
        finalTotal,
        data.cartTotal,
        coupon,
        user._id!,
        totalSaved
      );

      if (!response?.success) {
        toast.error(
          response?.message ||
            "Order creation failed."
        );
        return;
      }

      emptyCart();

      router.replace(
        `/order/${response.orderId}`
      );
    } catch (error) {
      console.error(
        "Error placing order:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again."
      );
    } finally {
      setPlaceOrderLoading(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="mb-6 text-center text-2xl font-bold">
        CHECKOUT
      </h1>

      <div className="flex flex-col gap-8 lg:flex-row">

        {/* ================================================================== */}
        {/* LEFT SECTION                                                       */}
        {/* ================================================================== */}

        <div className="w-full lg:w-2/3">

          {/* ---------------------------------------------------------------- */}
          {/* Stepper                                                          */}
          {/* ---------------------------------------------------------------- */}

          <div className="mb-8 flex items-center justify-between">
            {[
              {
                number: 1,
                icon: MapPin,
                label: "Delivery Address",
              },
              {
                number: 2,
                icon: Ticket,
                label: "Apply Coupon",
              },
              {
                number: 3,
                icon: CreditCard,
                label: "Choose Payment Method",
              },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.number}
                  className="flex flex-1 items-center"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        isActive(item.number)
                          ? "border-primary bg-primary text-white"
                          : isCompleted(item.number)
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-gray-300 bg-gray-200 text-gray-500"
                      }`}
                    >
                      {isCompleted(
                        item.number
                      ) ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>

                    <span
                      className={`mt-2 hidden text-sm lg:block ${
                        isActive(item.number)
                          ? "font-semibold text-primary"
                          : isCompleted(item.number)
                          ? "text-green-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  {index < 2 && (
                    <div
                      className={`mx-4 flex-1 border-t-2 ${
                        step > item.number
                          ? "border-primary"
                          : "border-gray-300"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Step 1 - Address                                                 */}
          {/* ---------------------------------------------------------------- */}

          {step === 1 && (
            <form
              onSubmit={form.onSubmit(
                async (values) => {
                  if (!user?._id) {
                    toast.error(
                      "User information is not available."
                    );
                    return;
                  }

                  try {
                    const result =
                      await saveAddress(
                        {
                          ...values,
                          active: true,
                        },
                        user._id
                      );

                    if (!result.success) {
                      toast.error(
                        result.message ||
                          "Unable to save address."
                      );
                      return;
                    }

                    setAddress(
                      result.address ?? null
                    );

                    setUser((current) => ({
                      ...current,
                      address: {
                        ...values,
                        active: true,
                      },
                    }));

                    toast.success(
                      "Address saved successfully."
                    );

                    nextStep();
                  } catch (error) {
                    console.error(
                      "Error saving address:",
                      error
                    );

                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Unable to save address."
                    );
                  }
                }
              )}
              className="space-y-4"
            >
              <DeliveryAddressForm
                form={form}
              />
            </form>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Step 2 - Coupon                                                  */}
          {/* ---------------------------------------------------------------- */}

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

          {/* ---------------------------------------------------------------- */}
          {/* Step 3 - Payment                                                 */}
          {/* ---------------------------------------------------------------- */}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                Choose Payment Method
              </h2>

              <RadioGroup
                value={paymentMethod}
                onValueChange={
                  setPaymentMethod
                }
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="cod"
                    id="cod"
                  />

                  <Label htmlFor="cod">
                    Cash on Delivery (COD)
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="stripe"
                    id="stripe"
                  />

                  <Label htmlFor="stripe">
                    Stripe
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Navigation                                                       */}
          {/* ---------------------------------------------------------------- */}

          <div className="mt-6 flex justify-between">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
              >
                Previous
              </Button>
            )}

            {step < 3 && (
              <Button
                type="button"
                onClick={nextStep}
                className="ml-auto"
              >
                Continue
              </Button>
            )}
          </div>
        </div>

        {/* ================================================================== */}
        {/* ORDER SUMMARY                                                      */}
        {/* ================================================================== */}

        <div className="w-full self-start bg-gray-100 lg:sticky lg:top-4 lg:w-1/3">
          <div className="p-6">

            <h2 className="mb-4 text-xl font-semibold">
              Order Summary
            </h2>

            {/* Products */}

            <div className="space-y-4">
              {data.products.map(
                (item, index) => (
                  <div
                    key={item._id || index}
                    className="flex items-center gap-4"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 object-cover"
                    />

                    <div>
                      <h3 className="text-sm font-medium">
                        {item.name}
                      </h3>

                      <p className="text-sm text-muted-foreground">
                        Size: {item.size}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Qty: {item.qty}
                      </p>

                      <p className="text-sm font-semibold">
                        ₹ {item.price} ×{" "}
                        {item.qty} = ₹
                        {Number(item.price) *
                          Number(item.qty)}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Totals */}

            <div className="mt-6 space-y-2">

              <div className="flex justify-between">
                <span>
                  Subtotal (
                  {data.products.length}{" "}
                  {data.products.length === 1
                    ? "Item"
                    : "Items"}
                  ):
                </span>

                <strong>
                  ₹ {cartTotal}
                </strong>
              </div>

              <div className="flex justify-between text-green-600">
                <span>
                  Cart Discount:
                </span>

                <strong>
                  - ₹ {totalSaved.toFixed(2)}
                </strong>
              </div>

              <div className="flex justify-between text-green-600">
                <span>
                  Shipping Charges:
                </span>

                <span>Free</span>
              </div>

              <div className="flex justify-between text-lg font-semibold">
                <span>
                  {totalAfterDiscount
                    ? "Total:"
                    : "Total before:"}
                </span>

                <span>
                  ₹ {data.cartTotal}
                </span>
              </div>

              {/* Coupon */}

              {discount > 0 && (
                <div className="flex justify-between bg-green-700 p-2 text-sm text-white">
                  <span>
                    Coupon applied:
                  </span>

                  <strong>
                    {discount}%
                  </strong>
                </div>
              )}

              {/* Discounted Total */}

              {totalAfterDiscount &&
                Number(totalAfterDiscount) <
                  Number(data.cartTotal) && (
                  <div className="flex justify-between p-2 text-lg">
                    <span>
                      Total after Discount:
                    </span>

                    <strong>
                      ₹ {totalAfterDiscount}
                    </strong>
                  </div>
                )}
            </div>

            {/* Place Order */}

            <Button
              type="button"
              onClick={placeOrderHandler}
              disabled={isDisabled}
              className="mt-4 flex h-[45px] w-full justify-center gap-2 bg-green-700 text-white disabled:bg-gray-300"
            >
              {placeOrderLoading ? (
                <>
                  <Loader className="animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  {getButtonText()}

                  <FaArrowAltCircleRight
                    size={25}
                  />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
