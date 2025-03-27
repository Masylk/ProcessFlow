import { useColors } from '@/app/theme/hooks';
import IconModifier from '@/app/dashboard/components/IconModifier';

interface IconUploadProps {
  currentIcon?: string | null;
  onIconChange: (iconUrl: string | null) => void;
}

export default function IconUpload({
  currentIcon,
  onIconChange,
}: IconUploadProps) {
  const colors = useColors();

  const handleIconUpdate = (icon?: string, emote?: string) => {
    onIconChange(icon || null);
  };

  return (
    <div className="flex flex-col gap-2">
      <label
        className="text-sm font-medium"
        style={{ color: colors['text-primary'] }}
      >
        Flow Icon
      </label>
      <IconModifier
        initialIcon={currentIcon || undefined}
        onUpdate={handleIconUpdate}
        allowEmoji={false}
      />
    </div>
  );
}
