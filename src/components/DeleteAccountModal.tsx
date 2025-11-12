import { useDeleteAccount } from "@/db/queries";
import { FC } from "react";
import { CheckCircle } from "react-feather";
import { useToast, Text, Modal, View, Button } from "reshaped";

export const DeleteAccountModal: FC<{
  deleteAccountId: number | null;
  onClose: () => void;
  onDelete?: () => void;
}> = ({ deleteAccountId, onClose, onDelete }) => {
  const toast = useToast();
  const { mutateAsync: deleteAccount } = useDeleteAccount();

  const handleDelete = async () => {
    if (deleteAccountId != null) {
      await deleteAccount(deleteAccountId);
      toast.show({
        text: "The entry has been deleted successfully.",
        icon: CheckCircle,
      });
      onClose();
      onDelete?.();
    }
  };

  return (
    <Modal active={deleteAccountId != null} onClose={onClose}>
      <View gap={2}>
        <Modal.Title>Delete Account</Modal.Title>
        <Text>
          Are you sure you want to delete this account? This action cannot be
          undone.
        </Text>

        <View direction="row" justify="end" gap={2}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="critical">
            Delete
          </Button>
        </View>
      </View>
    </Modal>
  );
};
