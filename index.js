import React, { Component } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        overflow: 'hidden',
    },
    slotWrapper: {
        backgroundColor: 'gray',
        //marginLeft: 5,
    },
    slotInner: {
        backgroundColor: 'black',
        //alignSelf: 'stretch',
        justifyContent: 'center',
        alignItems: 'center',
        //padding: 2,
    },
    text: {
        fontSize: 50,
        top: -2,
        fontWeight: 'bold',
        color: '#b5b7ba',
    },
    innerBorder: {
        position: 'absolute',
        top: 1,
        right: 1,
        left: 1,
        bottom: 1,
        borderColor: 'black',
        borderWidth: 1,
        zIndex: 1,
    },
    outerBorder: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        borderColor: '#989898',
        borderWidth: 1,
        zIndex: 1,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        backgroundColor: '#ffffff77'
    }
});

export default class SlotMachine extends Component {

    static get defaultProps() {
        return {
            text: 0,
            width: 37,
            height: 50,
            padding: 4,
            duration: 2000,
            delay: 0,
            slotInterval: 500,
            defaultChar: '0',
            range: '9876543210',
            initialAnimation: true,
            styles: {},
            renderTextContent: (currentChar) => currentChar,
            useNativeDriver: false,
        };
    }

    constructor(props) {
        super(props);
        this.renderSlot = this.renderSlot.bind(this);
        this.startInitialAnimation = this.startInitialAnimation.bind(this);
        this.renderContent = this.renderContent.bind(this);

        this.text = props.text;
        let values;
        if (props.initialAnimation) {
            values = this.getInitialSlotsValues(props);
        } else {
            values = this.getAlignedValues(props).map(val => new Animated.Value(val));
        }
        this.state = { values, initialAnimation: false };
    }

    componentDidMount() {
        const { delay, initialAnimation } = this.props;
        if (!initialAnimation) {
            return;
        }
        setTimeout(this.startInitialAnimation, delay);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.text === this.text) {
            return;
        }
        this.text = newProps.text;
        const { range, rangeInArray, duration, useNativeDriver } = newProps;
        const easing = Easing.inOut(Easing.ease);
        const paddedStr = this.getPaddedString(newProps);
        const newValues = this.getAdjustedAnimationValues(newProps);

        /*
            code for single letter scrolling
         this.setState({ values: newValues }, () => {
            const newAnimations = paddedStr.split('').map((char, i) => {
                const index = range.indexOf(char);
                const animationValue = -1 * (index) * newProps.height;
                return Animated.timing(this.state.values[i], { toValue: animationValue, duration, easing, useNativeDriver: useNativeDriver });
            });
            Animated.parallel(newAnimations).start();
        }); */

        this.setState({ values: newValues }, () => {
            const index = rangeInArray.findIndex(e => e == paddedStr);
            if (index != -1) {
                const animationValue = -1 * (index) * newProps.height;
                const newAnimations = [Animated.timing(this.state.values[0], { toValue: animationValue, duration, easing, useNativeDriver: useNativeDriver })];
                Animated.parallel(newAnimations).start();
            }
        });
    }

    getAdjustedAnimationValues(props) {
        const { values } = this.state;
        const paddedStr = this.getPaddedString(props);
        if (this.props.rangeInArray && this.props.rangeInArray.length > 0) {
            return values;
        }
        let neededValues = paddedStr.length - values.length;

        if (neededValues <= 0) {
            return values;
        }

        const defaultIndex = props.rangeInArray.findIndex(e => e == props.defaultChar);
        const defaultPosition = this.getPosition(defaultIndex, props);
        const newValues = [...values];

        while (neededValues--) {
            newValues.unshift(new Animated.Value(defaultPosition));
        }

        return newValues;
    }

    /*
        getAdjustedAnimationValues(props) {
            const { values } = this.state;
            const paddedStr = this.getPaddedString(props);
            let neededValues = paddedStr.length - values.length;
    
            if (neededValues <= 0) {
                return values;
            }
    
            const defaultIndex = props.range.indexOf(props.defaultChar);
            const defaultPosition = this.getPosition(defaultIndex, props);
            const newValues = [...values];
    
            while (neededValues--) {
                newValues.unshift(new Animated.Value(defaultPosition));
            }
    
            return newValues;
        }
        */

    getPosition(index, props = this.props) {
        const position = -1 * (index) * props.height;
        return position;
    }

    /*
     getAlignedValues(props) {
         const paddedStr = this.getPaddedString();
         const { range } = props;
 
         const values = paddedStr.split('').map((char) => {
             const index = range.indexOf(char);
             const animationValue = this.getPosition(index, props);
             return animationValue;
         });
 
         return values;
     }*/

    getAlignedValues(props) {
        const paddedStr = this.getPaddedString();
        const { range, rangeInArray } = props;
        const index = rangeInArray.findIndex(e => e == paddedStr);
        const values = [this.getPosition(index, props)];
        return values;
    }

    /*
    getInitialSlotsValues(props) {
        const values = [];
        const strNum = String(this.text);
        const animationValue = this.getPosition(props.range.length - 1, props);

        let slotCount = Math.max(props.padding, strNum.length);
        while (slotCount--) {
            values.push(new Animated.Value(animationValue));
        }

        return values;
    }*/

    getInitialSlotsValues(props) {
        const values = [];
        const animationValue = this.getPosition(props.rangeInArray.length - 1, props);
        values.push(new Animated.Value(animationValue));
        return values;
    }

    getPaddedString(props = this.props) {
        const { defaultChar } = props;
        let paddedText = String(this.text);
        if (!paddedText) {
            paddedText = defaultChar;
        }
        return paddedText;
    }

    /*
    getPaddedString(props = this.props) {
        const {padding, defaultChar} = props;

        let paddedText = String(this.text);
        let neededPadding = Math.max(0, padding - paddedText.length);
        while ((neededPadding--) > 0) {
            paddedText = `${defaultChar}${paddedText}`;
        }

        return paddedText;
    } 

    generateSlots() {
        const paddedStr = this.getPaddedString();
        const elements = paddedStr.split('').map(this.renderSlot);
        return elements;
    } */

    generateSlots() {
        const paddedStr = this.getPaddedString();
        const elements = this.renderSlot(paddedStr, 0);
        return elements;
    }
    /*
    startInitialAnimation() {
        const { values } = this.state;
        const { duration, slotInterval, useNativeDriver } = this.props;
        const easing = Easing.inOut(Easing.ease);

        const animations = values.map((value, i) => {
            const animationDuration = duration - (values.length - 1 - i) * slotInterval;
            return Animated.timing(value, { toValue: 0, duration: animationDuration, easing, useNativeDriver: useNativeDriver });
        });

        Animated.parallel(animations).start(() => {
            const newValues = this.getAlignedValues(this.props);
            newValues.forEach((value, i) => values[i].setValue(value));
            this.setState({ initialAnimation: false });
        });

        this.setState({ initialAnimation: true });
    }*/

    startInitialAnimation() {
        const { values } = this.state;
        const { duration, slotInterval, useNativeDriver } = this.props;
        const easing = Easing.inOut(Easing.ease);

        const animations = values.map((value, i) => {
            const animationDuration = duration - (values.length - 1 - i) * slotInterval;
            return Animated.timing(value, { toValue: 0, duration: animationDuration, easing, useNativeDriver: useNativeDriver });
        });

        Animated.parallel(animations).start(() => {
            const newValues = this.getAlignedValues(this.props);
            newValues.forEach((value, i) => values[i].setValue(value));
            this.setState({ initialAnimation: false });
        });

        this.setState({ initialAnimation: true });
    }

    spinTo(value) {
        this.text = value;
        const values = this.getInitialSlotsValues(this.props);
        this.setState({ values }, () => this.startInitialAnimation());
    }

    renderContent(currentChar, i, range) {
        const { styles: overrideStyles, renderTextContent } = this.props;
        const textContent = renderTextContent(currentChar, i, range);
        return textContent; //(<Text style={[styles.text, overrideStyles.text]}>{textContent}</Text>);
    }

    /*
    renderSlot(charToShow, position) {
        const {range, styles: overrideStyles, height, width, renderContent = this.renderContent,backgroundColor} = this.props;
        const {initialAnimation, values} = this.state;
        const charToShowIndex = range.indexOf(charToShow);

        const slots = range.split('').map((num, i) => {
            let currentChar = num;
            if (initialAnimation) {
                const currentIndex = (i + charToShowIndex) % range.length;
                currentChar = range[currentIndex];
            }

            const content = renderContent(currentChar, i, range);
            return (
                <Animated.View
                    key={i}
                    style={[styles.slotInner, { height, backgroundColor }, overrideStyles.slotInner, { transform: [{ translateY: values[position] }] }]}
                >
                    <Text style={[styles.text, overrideStyles.text]}>{content}</Text>
                </Animated.View>
            );
        });
        return (
            <View key={position} style={[styles.slotWrapper, { height, width }, overrideStyles.slotWrapper]}>
                {slots}

                 <View style={[styles.innerBorder, overrideStyles.innerBorder]} />
                <View style={[styles.outerBorder, overrideStyles.outerBorder]} />
                <View style={[styles.overlay, {bottom: height / 1.6}, overrideStyles.overlay]} /> 
            </View>
        );
    }
    */

    renderSlot(charToShow, position) {
        const { rangeInArray, styles: overrideStyles, height, width, renderContent = this.renderContent, backgroundColor } = this.props;
        const { initialAnimation, values } = this.state;
        const charToShowIndex = rangeInArray.findIndex(e => e == charToShow);
        const slots = rangeInArray.map((val, i) => {
            let currentChar = val;
            if (initialAnimation) {
                const currentIndex = (i + charToShowIndex) % rangeInArray.length;
                currentChar = rangeInArray[currentIndex];
            }
            const content = currentChar;
            return (
                <Animated.View
                    key={i}
                    style={[styles.slotInner, { height, backgroundColor }, overrideStyles.slotInner, { transform: [{ translateY: values[position] }] }]}
                >
                    <Text style={[styles.text, overrideStyles.text]}>{content}</Text>
                </Animated.View>
            );
        });

        return (
            <View key={position} style={[styles.slotWrapper, { height, width }, overrideStyles.slotWrapper]}>
                {slots}
            </View>
        );
    }

    render() {
        const slots = this.generateSlots();
        return (
            <View style={[styles.container, this.props.styles.container]}>
                {slots}
            </View>
        );
    }
}
