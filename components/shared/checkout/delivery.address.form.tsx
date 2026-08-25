import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";
import { useFormStatus } from "react-dom";

const DeliveryAddressForm = ({ form }: { form: any }) => {
  const { pending } = useFormStatus();
  const FieldError = ({ error }: { error?: string }) =>
    error ? <p className="mt-1 text-sm text-red-500">{error}</p> : null;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName">First Name</label>
          <Input
            id="firstName"
            placeholder="First Name"
            {...form.getInputProps("firstName")}
            required
          />
          <FieldError error={form.errors.firstName} />
        </div>
        <div>
          <label htmlFor="lastName">Last Name</label>
          <Input
            id="lastName"
            placeholder="Last Name"
            {...form.getInputProps("lastName")}
            required
          />
          <FieldError error={form.errors.lastName} />
        </div>
      </div>
      <div>
        <label htmlFor="phone">Phone Number</label>
        <Input
          id="phone"
          placeholder="Phone Number"
          {...form.getInputProps("phoneNumber")}
          required
        />
        <FieldError error={form.errors.phoneNumber} />
      </div>
      <div>
        <label htmlFor="state">State</label>
        <Input
          id="state"
          placeholder="State"
          {...form.getInputProps("state")}
          required
        />
        <FieldError error={form.errors.state} />
      </div>
      <div>
        <label htmlFor="city">City</label>
        <Input
          id="city"
          placeholder="City"
          {...form.getInputProps("city")}
          required
        />
        <FieldError error={form.errors.city} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="zipCode">Zip Code / Postal Code</label>
          <Input
            id="zipCode"
            placeholder="Zip Code / Postal Code"
            {...form.getInputProps("zipCode")}
            required
          />
          <FieldError error={form.errors.zipCode} />
        </div>
      </div>
      <div>
        <label htmlFor="address1">Address 1</label>
        <Input
          id="address1"
          placeholder="Address 1"
          {...form.getInputProps("address1")}
          required
        />
        <FieldError error={form.errors.address1} />
      </div>
      <div>
        <label htmlFor="address2">Address 2</label>
        <Input
          id="address2"
          placeholder="Address 2"
          {...form.getInputProps("address2")}
        />
        <FieldError error={form.errors.address2} />
      </div>
      <div>
        <label htmlFor="country">Country</label>
        <Input
          id="country"
          placeholder="Country"
          {...form.getInputProps("country")}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Submitting..." : "Submit"}
      </Button>
    </div>
  );
};

export default DeliveryAddressForm;
