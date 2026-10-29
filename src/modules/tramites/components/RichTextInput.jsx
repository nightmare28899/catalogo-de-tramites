import { useRef } from "react";
import { Button, Input, Space, Typography } from "antd";
import { BoldOutlined, UnorderedListOutlined } from "@ant-design/icons";
import SafeRichText from "./SafeRichText";

// Value/onChange compatible with antd Form.Item. Toolbar inserts the safe markup.
const RichTextInput = ({ value = "", onChange, id, maxLength = 2000, placeholder }) => {
    const ref = useRef(null);

    const apply = (kind) => {
        const el = ref.current?.resizableTextArea?.textArea;
        const start = el?.selectionStart ?? value.length;
        const end = el?.selectionEnd ?? value.length;
        const selected = value.slice(start, end);
        const insert = kind === "bold" ? `**${selected || "texto"}**` : `\n- ${selected || "elemento"}`;
        onChange?.(value.slice(0, start) + insert + value.slice(end));
    };

    return (
        <div>
            <Space size={8} style={{ marginBottom: 6 }}>
                <Button size="small" icon={<BoldOutlined />} onClick={() => apply("bold")}>Negrita</Button>
                <Button size="small" icon={<UnorderedListOutlined />} onClick={() => apply("list")}>Lista</Button>
            </Space>
            <Input.TextArea
                id={id} ref={ref} rows={4} value={value} maxLength={maxLength} showCount placeholder={placeholder}
                onChange={(e) => onChange?.(e.target.value)}
            />
            {value.trim() && (
                <div className="mq-richtext-preview">
                    <Typography.Text type="secondary">Vista previa</Typography.Text>
                    <SafeRichText text={value} />
                </div>
            )}
        </div>
    );
};

export default RichTextInput;
