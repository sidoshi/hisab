import { FC, useEffect, useState } from "react";
import { Button, FormControl, Modal, TextField, View } from "reshaped";
import { Radio } from "react-feather";
import { Bot } from "grammy";
import { setupBot } from "@/bot";
import { LazyStore } from "@tauri-apps/plugin-store";

type TelegramAPIKeyDialogFormProps = {
  apiKey?: string;
  onSave: (apiKey: string) => void;
};

const TelegramAPIKeyDialogForm: FC<TelegramAPIKeyDialogFormProps> = ({
  apiKey: initialApiKey,
  onSave,
}) => {
  const [apiKey, setApiKey] = useState(initialApiKey || "");

  return (
    <View gap={3} paddingBlock={4}>
      <View>
        <FormControl required>
          <FormControl.Label>Telegram API Key</FormControl.Label>
          <TextField
            value={apiKey}
            name="telegramApiKey"
            placeholder="Enter Telegram API Key"
            onChange={({ value }) => {
              setApiKey(value);
            }}
          />
        </FormControl>
      </View>

      <View>
        <Button onClick={() => onSave(apiKey)}>Save</Button>
      </View>
    </View>
  );
};

const useTelegramBot = (apiKey?: string) => {
  const [isBotRunning, setIsBotRunning] = useState(false);

  useEffect(() => {
    if (!apiKey) {
      return;
    }

    const bot = new Bot(apiKey);

    setupBot(bot);

    bot.start().catch((error) => {
      console.error("Failed to start Telegram bot:", error);
      setTimeout(() => {
        setIsBotRunning(false);
      }, 1000);
    });
    setIsBotRunning(true);

    return () => {
      bot.stop();
      console.log("Telegram bot stopped");
    };
  }, [apiKey]);

  return { isBotRunning };
};

export const TelegramBot: FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | undefined>(undefined);

  const store = new LazyStore("telegram.json");

  useEffect(() => {
    const loadApiKey = async () => {
      const storedApiKey = await store.get<string | undefined>(
        "telegramApiKey"
      );
      setApiKey(storedApiKey);
    };
    loadApiKey();
  }, []);

  const saveApiKey = async (key: string) => {
    await store.set("telegramApiKey", key);
    await store.save();
    setApiKey(key);
  };

  const { isBotRunning } = useTelegramBot(apiKey);

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        variant="ghost"
        color={isBotRunning ? "positive" : "neutral"}
        icon={<Radio />}
      />

      <Modal active={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <Modal.Title>Telegram Bot Settings</Modal.Title>

        <TelegramAPIKeyDialogForm
          apiKey={apiKey}
          onSave={(apiKey) => {
            saveApiKey(apiKey);
            setIsDialogOpen(false);
          }}
        />
      </Modal>
    </>
  );
};
