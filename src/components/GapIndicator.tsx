import { Badge } from '@fluentui/react-components';
import { WarningFilled } from '@fluentui/react-icons';

export function GapIndicator() {
  return (
    <Badge
      appearance="filled"
      color="danger"
      icon={<WarningFilled />}
      iconPosition="before"
    >
      Gap
    </Badge>
  );
}
