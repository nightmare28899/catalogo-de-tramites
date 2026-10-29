import { Button, Tooltip } from "antd";

/** Button driven by a permission verdict { allowed, reason }; explains itself when disabled. */
const GuardedButton = ({ verdict, children, ...props }) => {
    if (verdict.allowed) return <Button {...props}>{children}</Button>;
    return (
        <Tooltip title={verdict.reason}>
            <span tabIndex={0} role="button" aria-disabled="true" aria-label={`${typeof children === "string" ? children : "Acción"} no disponible: ${verdict.reason}`}>
                <Button {...props} disabled tabIndex={-1} style={{ pointerEvents: "none", ...props.style }}>{children}</Button>
            </span>
        </Tooltip>
    );
};

export default GuardedButton;
