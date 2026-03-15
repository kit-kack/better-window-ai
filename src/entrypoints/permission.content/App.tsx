import { Modal, Dropdown, Space, Button, Collapse, Badge, Tag } from "antd";
import {
  RiRobot2Line,
  RiShieldCheckLine,
  RiArrowDownSLine,
  RiForbidLine,
  RiCodeBoxLine,
  RiSparklingLine,
} from "@remixicon/react";
import { useEffect, useState } from "react";

export type PermissionResponse = "granted" | "denied" | "once" | "denyOnce";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ToolFunction {
  name: string;
  description?: string;
  parameters?: Record<string, any>;
}

interface Tool {
  type: "function";
  function: ToolFunction;
}

interface ModelConfig {
  id: string;
  name: string;
  model: string;
  enabled: boolean;
}

interface AppProps {
  body?: {
    messages?: Message[];
    tools?: Tool[];
    tool_choice?: string | Record<string, any>;
    [key: string]: any;
  };
  config?: ModelConfig;
  onResponse: (response: PermissionResponse) => void;
}

export function App({ body, config, onResponse }: AppProps) {
  const messages = body?.messages;
  const tools = body?.tools;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // 延迟显示以确保 DOM 已准备好
    setTimeout(() => setOpen(true), 100);
  }, []);

  const handleAllow = () => {
    setOpen(false);
    setTimeout(() => onResponse("granted"), 300);
  };

  const handleAllowOnce = () => {
    setOpen(false);
    setTimeout(() => onResponse("once"), 300);
  };

  const handleDeny = () => {
    setOpen(false);
    setTimeout(() => onResponse("denied"), 300);
  };

  const handleDenyOnce = () => {
    setOpen(false);
    setTimeout(() => onResponse("denyOnce"), 300);
  };

  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center gap-2">
          <RiRobot2Line size={24} className="text-blue-500" />
          <span className="text-lg font-semibold">AI 调用请求</span>
        </div>
      }
      onCancel={handleDenyOnce}
      width={480}
      centered
      mask={{
        closable: true,
      }}
      keyboard={false}
      footer={
        <Space>
          <Space.Compact>
            <Button
              variant="filled"
              color="danger"
              icon={<RiForbidLine size={16} />}
              onClick={handleDenyOnce}
            >
              拒绝
            </Button>
            <Dropdown
              placement="bottomRight"
              menu={{
                items: [
                  {
                    key: "allowForever",
                    label: "永久拒绝",
                    icon: <RiForbidLine size={16} />,
                    danger: true,
                    onClick: handleDeny,
                  },
                ],
              }}
            >
              <Button
                variant="filled"
                color="danger"
                icon={<RiArrowDownSLine size={16} />}
              />
            </Dropdown>
          </Space.Compact>
          <Space.Compact>
            <Button
              type="primary"
              icon={<RiShieldCheckLine size={16} />}
              onClick={handleAllowOnce}
            >
              允许
            </Button>
            <Dropdown
              placement="bottomRight"
              menu={{
                items: [
                  {
                    key: "allowForever",
                    label: "永久允许",
                    icon: <RiShieldCheckLine size={16} />,
                    onClick: handleAllow,
                  },
                ],
              }}
            >
              <Button type="primary" icon={<RiArrowDownSLine size={16} />} />
            </Dropdown>
          </Space.Compact>
        </Space>
      }
    >
      <div className="space-y-4">
        <ul className="text-sm">
          <p className="flex items-center gap-2">
            <span className="text-blue-500 ">•</span>
            <span>
              当前网站请求调用&nbsp;&nbsp;
              {config ? (
                <>
                  <Tag>
                    {config.name}/
                    <span className="font-bold">{config.model}</span>
                  </Tag>
                </>
              ) : (
                "AI模型"
              )}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <span className="text-blue-500">•</span>
            <span>您的 API Key 和配置信息不会被网站访问</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="text-blue-500">•</span>
            <span>所有 AI 调用都通过扩展安全执行</span>
          </p>
        </ul>

        {/* 提示词消息 */}
        {messages && messages.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <RiSparklingLine size={16} className="text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Prompt</span>
            </div>
            <Collapse
              size="small"
              className="bg-gray-50"
              items={messages.map((msg, index) => ({
                key: index,
                label: (
                  <div className="flex items-center gap-2">
                    <Badge
                      color={
                        msg.role === "system"
                          ? "purple"
                          : msg.role === "user"
                            ? "blue"
                            : "green"
                      }
                      text={
                        msg.role === "system"
                          ? "系统"
                          : msg.role === "user"
                            ? "用户"
                            : "助手"
                      }
                    />
                    <span className="max-w-70 text-xs text-gray-600 truncate">
                      {msg.content}
                    </span>
                  </div>
                ),
                children: (
                  <div className="max-h-40 overflow-y-auto pr-2 text-sm text-gray-700 whitespace-pre-wrap wrap-break-word scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {msg.content}
                  </div>
                ),
              }))}
            />
          </div>
        )}

        {/* Function Call / Tools 定义 */}
        {tools && tools.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <RiCodeBoxLine size={16} className="text-orange-500" />
              <span className="text-sm font-medium text-gray-700">
                Function Call
              </span>
            </div>
            <Collapse
              size="small"
              className="bg-gray-50"
              items={tools.map((tool, index) => ({
                key: `tool-${index}`,
                label: (
                  <div className="flex items-center gap-2">
                    <Badge color="orange" text={tool.function.name} />
                    <span className="max-w-70 text-xs text-gray-600 truncate">
                      {tool.function.description || "无描述"}
                    </span>
                  </div>
                ),
                children: (
                  <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
                    {tool.function.description && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-gray-700">
                          描述：
                        </span>
                        {tool.function.description}
                      </div>
                    )}
                    {tool.function.parameters && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          参数定义：
                        </div>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(tool.function.parameters, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ),
              }))}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
