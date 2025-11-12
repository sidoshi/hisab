import { useDeleteEntry } from "@/db/queries";
import { FC } from "react";
import { CheckCircle } from "react-feather";
import { useToast, Text, Modal, View, Button } from "reshaped";

export const DeleteEntryModal: FC<{
  deleteEntryId: number | null;
  onClose: () => void;
}> = ({ deleteEntryId, onClose }) => {
  const toast = useToast();
  const { mutateAsync: deleteEntry } = useDeleteEntry();

  const handleDelete = async () => {
    if (deleteEntryId != null) {
      await deleteEntry(deleteEntryId);
      toast.show({
        text: "The entry has been deleted successfully.",
        icon: CheckCircle,
      });
      onClose();
    }
  };

  return (
    <Modal active={deleteEntryId != null} onClose={onClose}>
      <View gap={2}>
        <Modal.Title>Delete Entry</Modal.Title>
        <Text>
          Are you sure you want to delete this entry? This action cannot be
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
