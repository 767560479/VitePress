# WPF 的 MVVM 模式

<!--
 * @Description:
 * @Author: zhengfei.tan
 * @Date: 2025-11-25 23:27:56
 * @FilePath: \VitePress\docs\C#\WPF的MVVM模式.md
-->

# WPF MVVM 模式全面复习与查缺补漏

## 1. MVVM 基础概念回顾

### 1.1 什么是 MVVM？

MVVM（Model-View-ViewModel）是一种软件架构模式，专门为 WPF 和 Silverlight 等 XAML-based 应用程序设计。

```csharp
// MVVM 三大组件关系
Model ←→ ViewModel ←→ View
```

### 1.2 各层职责

**Model（模型）**
- 表示业务数据和业务逻辑
- 不包含任何 UI 相关代码
- 通常包含数据验证逻辑

**View（视图）**
- 用户界面定义
- 仅包含展示逻辑
- 通过数据绑定与 ViewModel 交互

**ViewModel（视图模型）**
- View 的抽象表示
- 包含命令和可绑定属性
- 协调 Model 和 View 之间的交互

## 2. ViewModel 实现详解

### 2.1 INotifyPropertyChanged 接口

```csharp
using System.ComponentModel;
using System.Runtime.CompilerServices;

public abstract class ViewModelBase : INotifyPropertyChanged
{
    public event PropertyChangedEventHandler PropertyChanged;

    protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }

    protected bool SetProperty<T>(ref T field, T value, [CallerMemberName] string propertyName = null)
    {
        if (EqualityComparer<T>.Default.Equals(field, value))
            return false;
            
        field = value;
        OnPropertyChanged(propertyName);
        return true;
    }
}
```

### 2.2 完整的 ViewModel 示例

```csharp
public class UserViewModel : ViewModelBase
{
    private string _name;
    private string _email;
    private ObservableCollection<User> _users;

    public string Name
    {
        get => _name;
        set => SetProperty(ref _name, value);
    }

    public string Email
    {
        get => _email;
        set => SetProperty(ref _email, value);
    }

    public ObservableCollection<User> Users
    {
        get => _users;
        set => SetProperty(ref _users, value);
    }

    public ICommand AddUserCommand { get; }
    public ICommand DeleteUserCommand { get; }

    public UserViewModel()
    {
        Users = new ObservableCollection<User>();
        AddUserCommand = new RelayCommand(AddUser, CanAddUser);
        DeleteUserCommand = new RelayCommand<User>(DeleteUser);
    }

    private void AddUser()
    {
        var user = new User { Name = Name, Email = Email };
        Users.Add(user);
        Name = string.Empty;
        Email = string.Empty;
    }

    private bool CanAddUser()
    {
        return !string.IsNullOrWhiteSpace(Name) && 
               !string.IsNullOrWhiteSpace(Email);
    }

    private void DeleteUser(User user)
    {
        if (user != null)
            Users.Remove(user);
    }
}
```

## 3. 命令绑定 (ICommand)

### 3.1 RelayCommand 实现

```csharp
public class RelayCommand : ICommand
{
    private readonly Action _execute;
    private readonly Func<bool> _canExecute;

    public RelayCommand(Action execute, Func<bool> canExecute = null)
    {
        _execute = execute ?? throw new ArgumentNullException(nameof(execute));
        _canExecute = canExecute;
    }

    public event EventHandler CanExecuteChanged
    {
        add { CommandManager.RequerySuggested += value; }
        remove { CommandManager.RequerySuggested -= value; }
    }

    public bool CanExecute(object parameter) => _canExecute?.Invoke() ?? true;
    public void Execute(object parameter) => _execute();
}

// 泛型版本
public class RelayCommand<T> : ICommand
{
    private readonly Action<T> _execute;
    private readonly Func<T, bool> _canExecute;

    public RelayCommand(Action<T> execute, Func<T, bool> canExecute = null)
    {
        _execute = execute ?? throw new ArgumentNullException(nameof(execute));
        _canExecute = canExecute;
    }

    public event EventHandler CanExecuteChanged
    {
        add { CommandManager.RequerySuggested += value; }
        remove { CommandManager.RequerySuggested -= value; }
    }

    public bool CanExecute(object parameter) => _canExecute?.Invoke((T)parameter) ?? true;
    public void Execute(object parameter) => _execute((T)parameter);
}
```

## 4. 数据绑定深度解析

### 4.1 绑定模式

```xml
<!-- 各种绑定模式示例 -->
<TextBox Text="{Binding Name, Mode=TwoWay, UpdateSourceTrigger=PropertyChanged}" />
<TextBlock Text="{Binding Email, Mode=OneWay}" />
<ListBox ItemsSource="{Binding Users, Mode=OneWay}" />
<ContentControl Content="{Binding SelectedItem, Mode=OneWayToSource}" />
```

### 4.2 值转换器 (IValueConverter)

```csharp
public class BooleanToVisibilityConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
    {
        return (value is bool boolValue && boolValue) ? 
            Visibility.Visible : Visibility.Collapsed;
    }

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
    {
        return value is Visibility visibility && visibility == Visibility.Visible;
    }
}

// 在 XAML 中使用
<Window.Resources>
    <local:BooleanToVisibilityConverter x:Key="BoolToVisibilityConverter"/>
</Window.Resources>

<Button Visibility="{Binding IsEnabled, Converter={StaticResource BoolToVisibilityConverter}}"/>
```

### 4.3 数据验证

```csharp
public class User : IDataErrorInfo
{
    public string Name { get; set; }
    public string Email { get; set; }

    public string this[string columnName]
    {
        get
        {
            switch (columnName)
            {
                case nameof(Name):
                    if (string.IsNullOrWhiteSpace(Name))
                        return "姓名不能为空";
                    break;
                case nameof(Email):
                    if (string.IsNullOrWhiteSpace(Email))
                        return "邮箱不能为空";
                    else if (!Regex.IsMatch(Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                        return "邮箱格式不正确";
                    break;
            }
            return null;
        }
    }

    public string Error => null;
}
```

## 5. 高级 MVVM 模式

### 5.1 消息传递 (Messenger Pattern)

```csharp
public class Messenger
{
    private static readonly Dictionary<Type, List<Action<object>>> _actions = 
        new Dictionary<Type, List<Action<object>>>();

    public static void Register<T>(Action<T> action)
    {
        var type = typeof(T);
        if (!_actions.ContainsKey(type))
            _actions[type] = new List<Action<object>>();
            
        _actions[type].Add(obj => action((T)obj));
    }

    public static void Send<T>(T message)
    {
        var type = typeof(T);
        if (_actions.ContainsKey(type))
        {
            foreach (var action in _actions[type])
            {
                action(message);
            }
        }
    }
}

// 使用示例
public class UserAddedMessage
{
    public User User { get; set; }
}

// 发送消息
Messenger.Send(new UserAddedMessage { User = newUser });

// 接收消息
Messenger.Register<UserAddedMessage>(message =>
{
    // 处理新用户添加逻辑
});
```

### 5.2 依赖注入在 MVVM 中的应用

```csharp
public interface IUserService
{
    void AddUser(User user);
    IEnumerable<User> GetUsers();
}

public class UserService : IUserService
{
    public void AddUser(User user) { /* 实现 */ }
    public IEnumerable<User> GetUsers() { /* 实现 */ }
}

public class UserViewModel : ViewModelBase
{
    private readonly IUserService _userService;
    
    public UserViewModel(IUserService userService)
    {
        _userService = userService;
    }
}
```

## 6. 常见陷阱与最佳实践

### 6.1 内存泄漏预防

```csharp
// 错误示例 - 可能导致内存泄漏
public class LeakyViewModel
{
    public event EventHandler SomethingHappened;
    
    // 如果没有正确注销事件，可能导致内存泄漏
}

// 正确做法
public class SafeViewModel : ViewModelBase, IDisposable
{
    private bool _disposed = false;
    
    public void Dispose()
    {
        if (!_disposed)
        {
            // 清理资源、注销事件
            _disposed = true;
        }
    }
    
    ~SafeViewModel()
    {
        Dispose();
    }
}
```

### 6.2 异步编程模式

```csharp
public class AsyncViewModel : ViewModelBase
{
    private readonly IUserService _userService;
    private bool _isLoading;
    private string _statusMessage;

    public bool IsLoading
    {
        get => _isLoading;
        set => SetProperty(ref _isLoading, value);
    }

    public string StatusMessage
    {
        get => _statusMessage;
        set => SetProperty(ref _statusMessage, value);
    }

    public IAsyncCommand LoadUsersCommand { get; }

    public AsyncViewModel(IUserService userService)
    {
        _userService = userService;
        LoadUsersCommand = new AsyncRelayCommand(LoadUsersAsync);
    }

    private async Task LoadUsersAsync()
    {
        try
        {
            IsLoading = true;
            StatusMessage = "正在加载用户...";
            
            var users = await _userService.GetUsersAsync();
            // 处理用户数据
        }
        catch (Exception ex)
        {
            StatusMessage = $"加载失败: {ex.Message}";
        }
        finally
        {
            IsLoading = false;
        }
    }
}

// 异步命令实现
public class AsyncRelayCommand : ICommand
{
    private readonly Func<Task> _execute;
    private readonly Func<bool> _canExecute;
    private bool _isExecuting;

    public AsyncRelayCommand(Func<Task> execute, Func<bool> canExecute = null)
    {
        _execute = execute;
        _canExecute = canExecute;
    }

    public bool CanExecute(object parameter)
    {
        return !_isExecuting && (_canExecute?.Invoke() ?? true);
    }

    public async void Execute(object parameter)
    {
        _isExecuting = true;
        OnCanExecuteChanged();
        
        try
        {
            await _execute();
        }
        finally
        {
            _isExecuting = false;
            OnCanExecuteChanged();
        }
    }

    public event EventHandler CanExecuteChanged;
    
    protected virtual void OnCanExecuteChanged()
    {
        CanExecuteChanged?.Invoke(this, EventArgs.Empty);
    }
}
```

## 7. 测试 MVVM 应用程序

### 7.1 ViewModel 单元测试

```csharp
[TestFixture]
public class UserViewModelTests
{
    [Test]
    public void AddUserCommand_WhenDataValid_AddsUserToCollection()
    {
        // Arrange
        var viewModel = new UserViewModel();
        viewModel.Name = "Test User";
        viewModel.Email = "test@example.com";
        
        // Act
        viewModel.AddUserCommand.Execute(null);
        
        // Assert
        Assert.AreEqual(1, viewModel.Users.Count);
        Assert.AreEqual("Test User", viewModel.Users[0].Name);
    }
    
    [Test]
    public void CanAddUser_WhenNameEmpty_ReturnsFalse()
    {
        // Arrange
        var viewModel = new UserViewModel();
        viewModel.Name = string.Empty;
        viewModel.Email = "test@example.com";
        
        // Act & Assert
        Assert.IsFalse(viewModel.AddUserCommand.CanExecute(null));
    }
}
```

