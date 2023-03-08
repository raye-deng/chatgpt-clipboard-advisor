## ChatGPT剪贴板顾问
<img src="./assets/open-ai-logo.png" style="max-height:120px;" />

[中文](./README-ZH.MD) | [English](./README.md)

ChatGPT剪贴板顾问是一款基于ChatGPT-3.5的聊天机器人，可以根据您的剪贴板内容提供建议。

我认为聊天和人工智能应该能够集成并在任何地方使用，而不仅仅局限于浏览器或特定应用程序。系统剪贴板是一个很好的集成点，所以我开发了这个小工具。

---

## 如何使用
您可以使用此工具获取有关剪贴板内容的建议。 在复制您的问题或主题后，使用快捷键 command + q 来获取建议。
该工具将通过通知栏通知您有关请求的状态和结果，如下图所示。

![process-status-img](./assets/process-status.png)

### 角色切换
你可以通过在提交的问题前添加`$role_shortcut:`来切换角色，切换角色后，后续的对话无需再添加前缀，可以按照当前会话定义的角色进行沟通，

示例如下所示：

#### 翻译助理
```
t: What is the best way to learn GPT-3?
// 角色会切换为翻译助理，会将你提供的文本在中文和英文之间进行翻译，你会得到如下回复
什么是学习 GPT-3 的最佳方式？
```
#### 文档优化助理
```
d:weekly notes：
- [x] completed a translation assistant using GPT-3
- [x] completed a chat assistant utilizing GPT-3
- [x] completed a code assistant with the help of GPT-3

// 角色会切换为文档优化助理，会对你提供的文档进行优化，你会得到如下回复

Weekly notes:
- [x] Successfully developed a translation assistant using GPT-3
- [x] Successfully created a chat assistant using GPT-3
- [x] Finished developing a code assistant with the help of GPT-3

List of corrections made:
- Wording optimization: Used "Successfully developed" and "Successfully created" for a more professional tone.
- Verb tense correction: Changed "Finished developing" from "Completed" to match the past tense of the previous tasks.
- Formatting adjustment: Bullet points added for a clearer presentation of tasks.
```

#### 代码助理
```
c: implement a function to get the sum of two numbers
```
角色会切换为代码助理，会对你提供的代码进行优化或者按照你提供的文本生成代码，你会得到如下回复
```
def get_sum(num1, num2):
sum = num1 + num2
return sum
//This function takes in two arguments `num1` and `num2`, adds them together and returns the sum.
```


#### 聊天助理
```
r:今天天气如何
```
角色会切换为聊天助理，会根据你提供的文本进行回复，你会得到如下回复
```
抱歉，我是一個聊天機器人，所以我沒有辦法知道現在的天氣。但是，您可以透過其他平台，例如天氣預報網站或社交媒體上的天氣情況貼文，來得知今天的天氣如何。
```
## 如何安装
您可以在发布页面上下载Mac的安装包（当前仅支持Mac版本，将来会考虑Windows版）。

## 如何配置
当然，在使用之前，您需要从OpenAI获取API密钥，请通过Google了解特定的申请流程。



## roadmap
关于此工具的规划，我个人的目标是十分简单的：
- [x] 支持粘贴板访问OPENAI
- [x] 支持Mac
- [x] 支持聊天上下文
- [x] 增加以下常见场景的快捷命令：
    - [x] 聊天
    - [x] 代码助理
    - [x] 翻译助理
    - [x] 文档优化助理
    - [ ] 文档要点提取助理
- [ ] 支持Windows
