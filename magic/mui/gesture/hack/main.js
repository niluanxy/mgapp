/**
 * TODO: 通过创建一个隐藏的 DIV 对象，并触发其 touchmove 事件，则
 *       可避免 chrome 下，第一次滚动，调用 preventDefault 会爆出
 *       警告信息的问题，事件可绑定在 init 事件中。
 */