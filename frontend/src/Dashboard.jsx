import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");

  const token = localStorage.getItem("token");

  const fetchItems = async () => {
    const res = await axios.get("http://localhost:5000/items", {
      headers: { authorization: token }
    });
    setItems(res.data);
  };

  const addItem = async () => {
    await axios.post(
      "http://localhost:5000/items",
      { title, description: "" },
      { headers: { authorization: token } }
    );
    fetchItems();
  };

  const deleteItem = async (id) => {
    await axios.delete(`http://localhost:5000/items/${id}`, {
      headers: { authorization: token }
    });
    fetchItems();
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>

      <input placeholder="Item title" onChange={(e) => setTitle(e.target.value)} />
      <button onClick={addItem}>Add</button>

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.title}
            <button onClick={() => deleteItem(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;