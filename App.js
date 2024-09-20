import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, TextInput, Button, View, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Animatable from 'react-native-animatable';
import { StatusBar } from 'expo-status-bar';
import {
    requestForegroundPermissionsAsync,
    getCurrentPositionAsync,
    reverseGeocodeAsync,
} from 'expo-location';

export default function App() {
    const [descricao, setDescricao] = useState('');
    const [posicaoMarcador, setPosicaoMarcador] = useState(null);
    const [localizacao, setLocalizacao] = useState(null);
    const mapRef = useRef(null);

    const handlePostar = async () => {
        if (!posicaoMarcador) {
            Alert.alert('Erro', 'Por favor, selecione uma localização no mapa.');
            return;
        }

        try {
            // Geocodificação reversa para obter o nome da rua
            const [lugar] = await reverseGeocodeAsync(posicaoMarcador);
            console.log('Resultado da geocodificação:', lugar); // Verifica a resposta da API
            
            const nomeRua = lugar?.name || lugar?.street || lugar?.formatted_address || 'Localização desconhecida';

            console.log('Descrição da Ocorrência:', descricao );
            console.log('Localização:', nomeRua, lugar.street);
            Alert.alert('Postagem Bem-Sucedida', `Descrição: ${descricao}\nLocalização: ${lugar.street} , ${lugar.name}`);
        } catch (error) {
            console.error('Erro na geocodificação:', error);
            Alert.alert('Erro', 'Não foi possível obter o nome da rua.');
        }
    };

    const handlePressMapa = (e) => {
        setPosicaoMarcador(e.nativeEvent.coordinate);
    };

    const solicitarPermissoesLocalizacao = async () => {
        const { granted } = await requestForegroundPermissionsAsync();
        if (!granted) {
            Alert.alert('Permissão Negada', 'O acesso à localização é necessário para usar este recurso.');
            return;
        }

        try {
            const posicaoAtual = await getCurrentPositionAsync();
            setLocalizacao(posicaoAtual);
            setPosicaoMarcador(posicaoAtual.coords);
            mapRef.current.animateToRegion({
                latitude: posicaoAtual.coords.latitude,
                longitude: posicaoAtual.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            });
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível obter a localização atual.');
        }
    };

    useEffect(() => {
        solicitarPermissoesLocalizacao();
    }, []);

    return (
        <View style={styles.container}>
            <Animatable.View animation="fadeInDown" style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Descrição da ocorrência"
                    value={descricao}
                    onChangeText={setDescricao}
                />
            </Animatable.View>

            <MapView
                ref={mapRef}
                style={styles.map}
                onPress={handlePressMapa}
                initialRegion={localizacao ? {
                    latitude: localizacao.coords.latitude,
                    longitude: localizacao.coords.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                } : {
                    latitude: -8.056708678437472, // Latitude padrão
                    longitude: -34.89285908639431, // Longitude padrão
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                {posicaoMarcador && <Marker coordinate={posicaoMarcador} />}
            </MapView>

            <Animatable.View animation="bounceIn" style={styles.buttonContainer}>
                <Button title="Postar Ocorrência" onPress={handlePostar} />
            </Animatable.View>

            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    inputContainer: {
        padding: 50,
    },
    input: {
        height: 40,
        borderColor: '#000',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    map: {
        flex: 1,
    },
    buttonContainer: {
        padding: 10,
    },
});
