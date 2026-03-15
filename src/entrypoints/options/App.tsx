import { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  message,
  Space,
  List,
  Tag,
  Modal,
  Switch,
  Empty,
  Popconfirm,
  Badge,
  Tabs,
  Table,
  Select,
} from "antd";
import {
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiGlobalLine,
  RiKeyLine,
  RiShieldCheckLine,
  RiSettings3Line,
} from "@remixicon/react";
import {
  getAppSettings,
  addConfig,
  updateConfig,
  deleteConfig,
  setActiveConfig,
  createDefaultConfig,
  setPermission,
  clearPermission,
  type ModelConfig,
  type AppSettings,
  type PermissionStatus,
} from "~/utils/storage";

export function App() {
  const [settings, setSettings] = useState<AppSettings>({
    activeConfigId: "",
    configs: [],
    permissions: {},
  });
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ModelConfig | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("configs");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setInitializing(true);
      const data = await getAppSettings();
      setSettings(data);
    } catch (error) {
      message.error("加载配置失败");
    } finally {
      setInitializing(false);
    }
  };

  const handleAddConfig = () => {
    setEditingConfig(null);
    form.resetFields();
    form.setFieldsValue(createDefaultConfig());
    setModalVisible(true);
  };

  const handleEditConfig = (config: ModelConfig) => {
    setEditingConfig(config);
    form.setFieldsValue(config);
    setModalVisible(true);
  };

  const handleSaveConfig = async (values: any) => {
    try {
      setLoading(true);

      if (editingConfig) {
        await updateConfig(editingConfig.id, values);
        message.success("配置更新成功");
      } else {
        await addConfig(values);
        message.success("配置添加成功");
      }

      await loadSettings();
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("保存配置失败");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfig = async (id: string) => {
    try {
      await deleteConfig(id);
      message.success("配置删除成功");
      await loadSettings();
    } catch (error) {
      message.error("删除配置失败");
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      await setActiveConfig(id);
      message.success("已切换配置");
      await loadSettings();
    } catch (error) {
      message.error("切换配置失败");
    }
  };

  const handleToggleEnabled = async (config: ModelConfig) => {
    try {
      await updateConfig(config.id, { enabled: !config.enabled });
      await loadSettings();
    } catch (error) {
      message.error("更新状态失败");
    }
  };

  const handleChangePermission = async (
    origin: string,
    status: PermissionStatus,
  ) => {
    try {
      await setPermission(origin, status);
      message.success("权限已更新");
      await loadSettings();
    } catch (error) {
      message.error("更新权限失败");
    }
  };

  const handleDeletePermission = async (origin: string) => {
    try {
      await clearPermission(origin);
      message.success("权限已删除");
      await loadSettings();
    } catch (error) {
      message.error("删除权限失败");
    }
  };

  const permissionColumns = [
    {
      title: "网站",
      dataIndex: "origin",
      key: "origin",
      render: (origin: string) => (
        <div className="flex items-center gap-2">
          <RiGlobalLine size={16} className="text-gray-400" />
          <span className="font-mono text-sm">{origin}</span>
        </div>
      ),
    },
    {
      title: "权限状态",
      dataIndex: "status",
      key: "status",
      width: 200,
      render: (status: PermissionStatus, record: any) => (
        <Select
          value={status}
          onChange={(value) => handleChangePermission(record.origin, value)}
          style={{ width: 150 }}
          options={[
            {
              label: (
                <span className="flex items-center gap-2">
                  <Badge status="success" />
                  已授权
                </span>
              ),
              value: "granted",
            },
            {
              label: (
                <span className="flex items-center gap-2">
                  <Badge status="error" />
                  已拒绝
                </span>
              ),
              value: "denied",
            },
            {
              label: (
                <span className="flex items-center gap-2">
                  <Badge status="warning" />
                  每次询问
                </span>
              ),
              value: "prompt",
            },
          ]}
        />
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 100,
      render: (_: any, record: any) => (
        <Popconfirm
          title="确认删除"
          description="删除后该网站将恢复为默认状态（每次询问）"
          onConfirm={() => handleDeletePermission(record.origin)}
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <Button type="text" danger icon={<RiDeleteBinLine size={16} />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const permissionData = Object.entries(settings.permissions || {}).map(
    ([origin, status]) => ({
      key: origin,
      origin,
      status,
    }),
  );

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Card
          title={
            <div className="flex items-center gap-2">
              <RiSettings3Line size={24} />
              <span className="text-xl font-semibold">
                Better Window.AI 设置
              </span>
            </div>
          }
          className="shadow-sm"
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "configs",
                label: (
                  <span className="flex items-center gap-2">
                    <RiGlobalLine size={18} />
                    模型配置
                  </span>
                ),
                children: (
                  <div>
                    <div className="mb-4 flex justify-end">
                      <Button
                        type="primary"
                        icon={<RiAddLine size={16} />}
                        onClick={handleAddConfig}
                      >
                        添加配置
                      </Button>
                    </div>

                    {settings.configs.length === 0 ? (
                      <Empty
                        description="暂无配置，点击上方按钮添加"
                        className="py-12"
                      />
                    ) : (
                      <List
                        dataSource={settings.configs}
                        renderItem={(config) => {
                          const isActive =
                            config.id === settings.activeConfigId;

                          return (
                            <List.Item
                              className={`transition-all ${
                                isActive
                                  ? "bg-blue-50 border-l-4 border-blue-500 pl-4"
                                  : ""
                              }`}
                              actions={[
                                <Switch
                                  key="enabled"
                                  checked={config.enabled}
                                  onChange={() => handleToggleEnabled(config)}
                                  checkedChildren="启用"
                                  unCheckedChildren="禁用"
                                />,
                                <Button
                                  key="edit"
                                  type="text"
                                  icon={<RiEditLine size={16} />}
                                  onClick={() => handleEditConfig(config)}
                                >
                                  编辑
                                </Button>,
                                <Popconfirm
                                  key="delete"
                                  title="确认删除"
                                  description="删除后无法恢复，确定要删除吗？"
                                  onConfirm={() =>
                                    handleDeleteConfig(config.id)
                                  }
                                  okText="删除"
                                  cancelText="取消"
                                  okButtonProps={{ danger: true }}
                                >
                                  <Button
                                    type="text"
                                    danger
                                    icon={<RiDeleteBinLine size={16} />}
                                  >
                                    删除
                                  </Button>
                                </Popconfirm>,
                              ]}
                            >
                              <List.Item.Meta
                                title={
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">
                                      {config.name}
                                    </span>
                                    {isActive && (
                                      <Badge
                                        status="processing"
                                        text="当前使用"
                                      />
                                    )}
                                    <Tag>{config.model}</Tag>
                                  </div>
                                }
                                description={
                                  <div className="space-y-1 text-sm">
                                    <div>Base URL: {config.baseUrl}</div>
                                    <div>
                                      Temperature: {config.temperature} | Max
                                      Tokens: {config.maxTokens}
                                    </div>
                                  </div>
                                }
                              />
                              {!isActive && config.enabled && (
                                <Button
                                  type="link"
                                  onClick={() => handleSetActive(config.id)}
                                >
                                  设为当前
                                </Button>
                              )}
                            </List.Item>
                          );
                        }}
                      />
                    )}
                  </div>
                ),
              },
              {
                key: "permissions",
                label: (
                  <span className="flex items-center gap-2">
                    <RiShieldCheckLine size={18} />
                    网站授权
                    {permissionData.length > 0 && (
                      <Badge count={permissionData.length} />
                    )}
                  </span>
                ),
                children: (
                  <div>
                    {permissionData.length === 0 ? (
                      <Empty description="暂无网站授权记录" className="py-12" />
                    ) : (
                      <Table
                        columns={permissionColumns}
                        dataSource={permissionData}
                        pagination={false}
                      />
                    )}
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
                      <p className="font-semibold mb-2">说明：</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          <strong>已授权</strong>：网站可以直接调用 AI
                          功能，无需每次询问
                        </li>
                        <li>
                          <strong>已拒绝</strong>：网站无法调用 AI 功能
                        </li>
                        <li>
                          <strong>每次询问</strong>：网站每次调用 AI
                          时都会弹窗询问（默认状态）
                        </li>
                      </ul>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </Card>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>所有配置数据仅存储在本地浏览器中，不会上传到任何服务器</p>
        </div>
      </div>

      <Modal
        title={editingConfig ? "编辑配置" : "添加配置"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveConfig}
          autoComplete="off"
          className="mt-4"
        >
          <Form.Item
            label="配置名称"
            name="name"
            rules={[{ required: true, message: "请输入配置名称" }]}
            extra="为此配置起一个便于识别的名称"
          >
            <Input
              placeholder="例如：OpenAI GPT-4 / Claude / 本地 Ollama"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="flex items-center gap-2">
                <RiKeyLine size={16} />
                API Key
              </span>
            }
            name="apiKey"
            rules={[
              { required: true, message: "请输入 API Key" },
              { min: 5, message: "API Key 长度不能少于 5 个字符" },
            ]}
            extra="你的 API 密钥，将安全存储在本地"
          >
            <Input.Password placeholder="sk-..." size="large" />
          </Form.Item>

          <Form.Item
            label="Base URL"
            name="baseUrl"
            rules={[{ required: true, message: "请输入 Base URL" }]}
            extra="API 端点地址，例如：https://api.openai.com/v1"
          >
            <Input placeholder="https://api.openai.com/v1" size="large" />
          </Form.Item>

          <Form.Item
            label="模型"
            name="model"
            rules={[{ required: true, message: "请输入模型名称" }]}
            extra="模型名称，例如：gpt-4o, claude-3-5-sonnet-20241022, llama2"
          >
            <Input placeholder="gpt-4o" size="large" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Temperature"
              name="temperature"
              rules={[
                { required: true, message: "请输入 Temperature" },
                { type: "number", min: 0, max: 2, message: "范围: 0-2" },
              ]}
              extra="控制输出随机性 (0-2)"
            >
              <InputNumber
                className="w-full"
                size="large"
                min={0}
                max={2}
                step={0.1}
              />
            </Form.Item>

            <Form.Item
              label="Max Tokens"
              name="maxTokens"
              rules={[
                { required: true, message: "请输入 Max Tokens" },
                { type: "number", min: 1, message: "必须大于 0" },
              ]}
              extra="最大生成令牌数"
            >
              <InputNumber
                className="w-full"
                size="large"
                min={1}
                max={128000}
                step={100}
              />
            </Form.Item>
          </div>

          <Form.Item name="enabled" valuePropName="checked" initialValue={true}>
            <div className="flex items-center gap-2">
              <Switch />
              <span>启用此配置</span>
            </div>
          </Form.Item>

          <Form.Item className="mb-0 mt-6">
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
              >
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingConfig ? "更新" : "添加"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
