import * as React from 'react';
import { Text, FlatList, StyleSheet, View, Dimensions } from 'react-native';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, Easing, ReduceMotion, } from 'react-native-reanimated';

const dataArray: () => Array<string> = () => {
    let data = []
    for (let i = 1; i < 100; i++) {
        data.push('占位字符 ' + i.toString())
    }
    return data
}

function App() {
    const is_show = useSharedValue(0);
    const is_show_timeout = useSharedValue<any>(null);
    const set_is_show_timeout = ()=>{
        clearTimeout(is_show_timeout.value)
        is_show_timeout.value = setTimeout(() => {
            is_show.value = 0;
        }, 1500);
    }
    const flatList_ref = React.useRef<FlatList>(null);
    const flatList_overall_length = React.useRef<number>(100 * 50);
    const isPressed = useSharedValue(false);
    const offset = useSharedValue({ y: 0 });
    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: offset.value.y },
                { scale: withSpring(isPressed.value ? 1.2 : 1) },
            ],
            backgroundColor: isPressed.value ? '#19191B' : '#292C34',
            opacity: withTiming(is_show.value,  {
                duration: 300,
                easing: Easing.out(Easing.sin),
                reduceMotion: ReduceMotion.Never,
              })
        };
    });
    const start = useSharedValue({ y: 0 });
    const gesture = Gesture.Pan()
        .onBegin(() => {
            isPressed.value = true;
            is_show.value = 1;
            clearTimeout(is_show_timeout.value)
        })
        .onUpdate((e) => {
            const new_y = Math.min(Math.max(e.translationY + start.value.y, 0), height - 100)
            offset.value = {
                y: new_y,
            };
            const scale = new_y / height
            flatList_ref.current?.scrollToOffset({offset: scale * flatList_overall_length.current, animated: false})
        })
        .onEnd(() => {
            start.value = {
                y: offset.value.y,
            };
        })
        .onFinalize(() => {
            isPressed.value = false;
            set_is_show_timeout()
        }).runOnJS(true);
    return (
        <GestureHandlerRootView>
            <View>
                <GestureDetector gesture={gesture}>
                    <Animated.View style={[style.scroll_bar, animatedStyles]} />
                </GestureDetector>
                <FlatList
                    ref={flatList_ref}
                    data={dataArray()}
                    renderItem={({ item, index }) => <Text style={style.text} key={index}>{item}</Text>}
                    getItemLayout={(data, index) => ({ length: HEIGHT, offset: HEIGHT * index, index })}
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={8}
                    onScrollBeginDrag={()=>{is_show.value = 1; clearTimeout(is_show_timeout.value)}}
                    onMomentumScrollEnd={()=>{set_is_show_timeout()}}
                    onScroll={(event: any) => {
                        const offsetY = event.nativeEvent.contentOffset.y;
                        let contentHeight = event.nativeEvent.contentSize.height;
                        flatList_overall_length.current = contentHeight
                        if (offsetY !== 0) contentHeight = contentHeight - height;
                        const scale = offsetY / contentHeight
                        const phone_height = height - 100
                        if (!isPressed.value) {
                            offset.value = withTiming({ y: phone_height * scale, }, {
                                duration: 20,
                                easing: Easing.linear,
                                reduceMotion: ReduceMotion.Never,
                              })
                            // console.log({ y: phone_height * scale, })
                            // requestAnimationFrame(() => {(offset.value) = { y: phone_height * scale, }})
                            start.value = {
                                y: phone_height * scale,
                            };
                        }
                    }}
                />
            </View>
        </GestureHandlerRootView>
    )
}

const { height, } = Dimensions.get('window')
const HEIGHT = 50
const style = StyleSheet.create({
    text: {
        height: HEIGHT
    },
    scroll_bar: {
        zIndex: 1,
        position: 'absolute',
        top: 20,
        right: 10,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#292C34'
    }
})
export default App;