import { useCheckAccountCodeExists, useUpdateAccount } from "@/db/queries";
import { Account } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC } from "react";
import { CheckCircle } from "react-feather";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  Button,
  Card,
  FormControl,
  Modal,
  TextField,
  useToast,
  View,
} from "reshaped";
import { z } from "zod";

type AccountFormInputs = {
  name: string;
  code: string;
  phone: string | null;
};

const AccountFormSchema = z.object({
  name: z.string().min(4, "Account name is required"),
  code: z.string().min(3, "Code is required"),

  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number")
    .or(z.literal(""))
    .nullable(),
});

const EditAccountForm: FC<{
  account: Account;
  onSubmit: SubmitHandler<AccountFormInputs>;
  onClose: () => void;
}> = ({ account, onSubmit, onClose }) => {
  const form = useForm<AccountFormInputs>({
    defaultValues: {
      name: account.name,
      code: account.code,
      phone: account.phone,
    },
    resolver: zodResolver(AccountFormSchema),
  });
  const { handleSubmit, watch, setError } = form;

  const codeValue = watch("code");
  const { data: accountForCode } = useCheckAccountCodeExists(codeValue);

  const onFormSubmit: SubmitHandler<AccountFormInputs> = (data) => {
    if (accountForCode != null && accountForCode.id !== account.id) {
      setError("code", {
        type: "manual",
        message: "Code is already taken. Please choose another one.",
      });
      return;
    }

    onSubmit(data);
  };

  return (
    <View>
      <Card padding={3}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(onFormSubmit)(e);
          }}
        >
          <View gap={3}>
            <FormControl required>
              <FormControl.Label>Name</FormControl.Label>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    name="name"
                    hasError={!!fieldState.error}
                    onChange={({ value }) =>
                      field.onChange(value.toUpperCase())
                    }
                  />
                )}
              />
              <FormControl.Helper>
                {form.formState.errors.name?.message}
              </FormControl.Helper>
            </FormControl>

            <FormControl required>
              <FormControl.Label>Code</FormControl.Label>
              <Controller
                name="code"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    name="code"
                    hasError={!!fieldState.error}
                    onChange={({ value }) =>
                      field.onChange(value.toUpperCase())
                    }
                  />
                )}
              />
              <FormControl.Helper>
                {form.formState.errors.code?.message}
              </FormControl.Helper>
            </FormControl>

            <FormControl required>
              <FormControl.Label>Phone</FormControl.Label>
              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value || ""}
                    name="phone"
                    hasError={!!fieldState.error}
                    onChange={({ value }) => field.onChange(value)}
                  />
                )}
              />
              <FormControl.Helper>
                {form.formState.errors.phone?.message}
              </FormControl.Helper>
            </FormControl>

            <View direction="row" justify="end" gap={2}>
              <Button type="submit" elevated variant="solid" color="positive">
                Update
              </Button>

              <Button onClick={onClose} variant="faded" color="critical">
                Close
              </Button>
            </View>
          </View>
        </form>
      </Card>
    </View>
  );
};

type EditAccountModalProps = {
  account: Account | null;
  onClose: () => void;
};

export const EditAccountModal: FC<EditAccountModalProps> = ({
  account,
  onClose,
}) => {
  const { mutateAsync: updateAccount } = useUpdateAccount();
  const toast = useToast();

  const onSubmit: SubmitHandler<AccountFormInputs> = async (data) => {
    if (account == null) return;

    await updateAccount({
      accountId: account.id,
      accountUpdate: {
        name: data.name,
        code: data.code,
        phone: data.phone,
      },
    });

    toast.show({
      text: "The account has been updated successfully.",
      icon: CheckCircle,
    });

    onClose();
  };

  return (
    <Modal active={account != null} onClose={onClose}>
      <View gap={2}>
        <Modal.Title>Edit Account</Modal.Title>
        {account && (
          <EditAccountForm
            account={account}
            onSubmit={onSubmit}
            onClose={onClose}
          />
        )}
      </View>
    </Modal>
  );
};
