import React, { useRef, useEffect } from 'react';
import { Platform, View, Text, StyleSheet, WebView } from 'react-native';

interface MapWrapperProps {
  latitude: number;
  longitude: number;
  onDragEnd?: (coordinate: { latitude: number; longitude: number }) => void;
  style?: any;
  mapRef?: any;
}

export const MapWrapper: React.FC<MapWrapperProps> = ({
  latitude,
  longitude,
  onDragEnd,
  style,
  mapRef,
}) => {
  const webViewRef = useRef<WebView>(null);

  // Generar HTML para Google Maps embebido
  const generateMapHTML = () => {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || 'YOUR_API_KEY';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body, html { margin: 0; padding: 0; height: 100%; }
            #map { height: 100%; width: 100%; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            let map;
            let marker;
            
            function initMap() {
              map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: ${latitude}, lng: ${longitude} },
                zoom: 15,
                mapTypeId: 'satellite'
              });
              
              marker = new google.maps.Marker({
                position: { lat: ${latitude}, lng: ${longitude} },
                map: map,
                draggable: true,
                title: 'Ubicación del campo'
              });
              
              marker.addListener('dragend', function(event) {
                const newPosition = {
                  latitude: event.latLng.lat(),
                  longitude: event.latLng.lng()
                };
                
                // Enviar datos de vuelta a React Native
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'markerMoved',
                  coordinate: newPosition
                }));
              });
            }
          </script>
          <script async defer
            src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap">
          </script>
        </body>
      </html>
    `;
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerMoved' && onDragEnd) {
        onDragEnd(data.coordinate);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: generateMapHTML() }}
        style={styles.webview}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  webview: {
    flex: 1,
  },
  placeholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  placeholderText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
  },
});
